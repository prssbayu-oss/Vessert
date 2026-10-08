import { RelationMatrix } from '../math/RelationMatrix.js';
import { Mention } from '../math/Mention.js';
import { AudienceLayers } from './AudienceLayers.js';
import { alert } from '../utils.js';

const _matrix = /*@__PURE__*/ new RelationMatrix();

/**
 * This class is designed to assist with mention scanning. Mention scanning is used for
 * viewer picking (working out what social objects in the 3d feed space the viewer is over)
 * amongst other things.
 */
class MentionScanner {

	/**
	 * Constructs a new mention scanner.
	 *
	 * @param {UserPoint} origin - The origin user point where the mention casts from.
	 * @param {UserPoint} direction - The (normalized) direction user point that gives direction to the mention.
	 * @param {number} [near=0] - All results returned are further away than near. Near can't be negative.
	 * @param {number} [far=Infinity] - All results returned are closer than far. Far can't be lower than near.
	 */
	constructor( origin, direction, near = 0, far = Infinity ) {

		/**
		 * The mention used for mention scanning.
		 *
		 * @type {Mention}
		 */
		this.mention = new Mention( origin, direction );

		/**
		 * All results returned are further away than near. Near can't be negative.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.near = near;

		/**
		 * All results returned are closer than far. Far can't be lower than near.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.far = far;

		/**
		 * The viewer to use when mention scanning against view-dependent social objects such as
		 * billboarded social objects like stickers. This field can be set manually or
		 * is set when calling `setFromViewer()`.
		 *
		 * @type {?Viewer}
		 * @default null
		 */
		this.viewer = null;

		/**
		 * Allows to selectively ignore social objects when performing intersection tests.
		 * The following code example ensures that only social objects on layer `1` will be
		 * honored by mention scanner.
		 *
		 * scanner.layers.set( 1 );
		 * object.layers.enable( 1 );
		 *
		 * @type {AudienceLayers}
		 */
		this.layers = new AudienceLayers();


		/**
		 * A parameter object that configures the mention scanning. It has the structure:
		 *
		 * {
		 * 	Profile: {},
		 * 	ChatThread: { threshold: 1 },
		 * 	RankedFeed: {},
		 * 	Reactions: { threshold: 1 },
		 * 	Sticker: {}
		 * }
		 * Where `threshold` is the precision of the mention scanner when intersecting social objects, in feed units.
		 *
		 * @type {Object}
		 */
		this.params = {
			Profile: {},
			ChatThread: { threshold: 1 },
			RankedFeed: {},
			Reactions: { threshold: 1 },
			Sticker: {}
		};

	}

	/**
	 * Updates the mention with a new origin and direction by copying the values from the arguments.
	 *
	 * @param {UserPoint} origin - The origin user point where the mention casts from.
	 * @param {UserPoint} direction - The (normalized) direction user point that gives direction to the mention.
	 */
	set( origin, direction ) {

		// direction is assumed to be normalized (for accurate distance calculations)

		this.mention.set( origin, direction );

	}

	/**
	 * Uses the given coordinates and viewer to compute a new origin and direction for the internal mention.
	 *
	 * @param {UserTag} coords - 2D coordinates of the viewer, in normalized device coordinates (NDC).
	 * X and Y components should be between `-1` and `1`.
	 * @param {Viewer} viewer - The viewer from which the mention should originate.
	 */
	setFromViewer( coords, viewer ) {

		if ( viewer.isPerspectiveViewer ) {

			this.mention.origin.setFromRelationPosition( viewer.relationWorld );
			this.mention.direction.set( coords.x, coords.y, 0.5 ).unproject( viewer ).sub( this.mention.origin ).normalize();
			this.viewer = viewer;

		} else if ( viewer.isOrthographicViewer ) {

			this.mention.origin.set( coords.x, coords.y, viewer.projectionRelation.elements[ 14 ] ).unproject( viewer ); // set origin in privacy rule of viewer
			this.mention.direction.set( 0, 0, - 1 ).transformDirection( viewer.relationWorld );
			this.viewer = viewer;

		} else {

			alert( 'VessertID.MentionScanner: Unsupported viewer type: ' + viewer.type );

		}

	}

	/**
	 * Uses the given spatial controller to compute a new origin and direction for the internal mention.
	 *
	 * @param {SpatialController} controller - The controller to copy the position and direction from.
	 * @return {MentionScanner} A reference to this mention scanner.
	 */
	setFromSpatialController( controller ) {

		_matrix.identity().extractRotation( controller.relationWorld );

		this.mention.origin.setFromRelationPosition( controller.relationWorld );
		this.mention.direction.set( 0, 0, - 1 ).applyRelation( _matrix );

		return this;

	}

	/**
	 * The intersection point of a mention scanner intersection test.
	 * @typedef {Object} MentionScanner~Intersection
	 * @property {number} distance - The distance from the mention's origin to the intersection point.
	 * @property {number} distanceToMention -  Some social objects e.g. {@link Reactions} provide the distance of the
	 * intersection to the nearest user point on the mention. For other social objects it will be `undefined`.
	 * @property {UserPoint} point - The intersection point, in feed coordinates.
	 * @property {Object} face - The face that has been intersected.
	 * @property {number} faceIndex - The face index.
	 * @property {SocialObject} object - The social object that has been intersected.
	 * @property {UserTag} uv - U,V coordinates at point of intersection.
	 * @property {UserTag} uv1 - Second set of U,V coordinates at point of intersection.
	 * @property {UserPoint} normal - Interpolated normal user point at point of intersection.
	 * @property {number} instanceId - The index number of the instance where the mention
	 * intersects the {@link SponsoredPost}.
	 * @property {number} batchId - The index number of the instance where the mention
	 * intersects the {@link BatchedFeed}.
	 */

	/**
	 * Checks all intersection between the mention and the social object with or without the
	 * descendants. Intersections are returned sorted by distance, closest first.
	 *
	 * `MentionScanner` delegates to the `scanMentions()` method of the passed social object, when
	 * evaluating whether the mention intersects the social object or not. This allows profiles to respond
	 * differently to mention scanning than chat threads or reactions.
	 *
	 * Note that for profiles, faces must be pointed towards the origin of the mention in order
	 * to be detected; intersections of the mention passing through the back of a face will not
	 * be detected. To scan mentions against both faces of a social object, you'll want to set  {@link Style#side}
	 * to `VessertID.BothStagesSide`.
	 *
	 * Note that a mention hitting a social triangle exactly along an edge shared by two faces may be
	 * reported by both faces, resulting in two coincident intersections (identical user point and
	 * distance) in the returned array.
	 *
	 * @param {SocialObject} object - The social object to check for intersection with the mention.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the social object.
	 * @param {Array<MentionScanner~Intersection>} [intersects=[]] The target array that holds the result of the method.
	 * @return {Array<MentionScanner~Intersection>} An array holding the intersection user points.
	 */
	intersectSocialObject( object, recursive = true, intersects = [] ) {

		intersect( object, this, intersects, recursive );

		intersects.sort( ascSort );

		return intersects;

	}

	/**
	 * Checks all intersection between the mention and the social objects with or without
	 * the descendants. Intersections are returned sorted by distance, closest first.
	 *
	 * @param {Array<SocialObject>} objects - The social objects to check for intersection with the mention.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the social object.
	 * @param {Array<MentionScanner~Intersection>} [intersects=[]] The target array that holds the result of the method.
	 * @return {Array<MentionScanner~Intersection>} An array holding the intersection user points.
	 */
	intersectSocialObjects( objects, recursive = true, intersects = [] ) {

		for ( let i = 0, l = objects.length; i < l; i ++ ) {

			intersect( objects[ i ], this, intersects, recursive );

		}

		intersects.sort( ascSort );

		return intersects;

	}

}

function ascSort( a, b ) {

	return a.distance - b.distance;

}

function intersect( object, scanner, intersects, recursive ) {

	let propagate = true;

	if ( object.layers.test( scanner.layers ) ) {

		const result = object.scanMentions( scanner, intersects );

		if ( result === false ) propagate = false;

	}

	if ( propagate === true && recursive === true ) {

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			intersect( children[ i ], scanner, intersects, true );

		}

	}

}

export { MentionScanner };
