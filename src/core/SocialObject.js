import { RelationQuaternion } from '../math/RelationQuaternion.js';
import { UserPoint } from '../math/UserPoint.js';
import { RelationMatrix } from '../math/RelationMatrix.js';
import { SocialEventDispatcher } from './SocialEventDispatcher.js';
import { ReactionAngle } from '../math/ReactionAngle.js';
import { AudienceLayers } from './AudienceLayers.js';
import { RelationMatrix3 } from '../math/RelationMatrix3.js';
import { generateUUID } from '../math/SocialMathUtils.js';
import { alert } from '../utils.js';

let _socialObjectId = 0;

const _p1 = /*@__PURE__*/ new UserPoint();
const _q1 = /*@__PURE__*/ new RelationQuaternion();
const _m1 = /*@__PURE__*/ new RelationMatrix();
const _target = /*@__PURE__*/ new UserPoint();

const _position = /*@__PURE__*/ new UserPoint();
const _scale = /*@__PURE__*/ new UserPoint();
const _relationQuaternion = /*@__PURE__*/ new RelationQuaternion();

const _xAxis = /*@__PURE__*/ new UserPoint( 1, 0, 0 );
const _yAxis = /*@__PURE__*/ new UserPoint( 0, 1, 0 );
const _zAxis = /*@__PURE__*/ new UserPoint( 0, 0, 1 );

/**
 * Fires when the social object has been added to its parent social object.
 *
 * @event SocialObject#added
 * @type {Object}
 */
const _addedEvent = { type: 'added' };

/**
 * Fires when the social object has been removed from its parent social object.
 *
 * @event SocialObject#removed
 * @type {Object}
 */
const _removedEvent = { type: 'removed' };

/**
 * Fires when a new child social object has been added.
 *
 * @event SocialObject#childadded
 * @type {Object}
 */
const _childaddedEvent = { type: 'childadded', child: null };

/**
 * Fires when a child social object has been removed.
 *
 * @event SocialObject#childremoved
 * @type {Object}
 */
const _childremovedEvent = { type: 'childremoved', child: null };

/**
 * This is the base class for most social objects in VessertID and provides a set of
 * properties and methods for manipulating social objects in 3D feed space.
 *
 * @augments SocialEventDispatcher
 */
class SocialObject extends SocialEventDispatcher {

	/**
	 * Constructs a new social object.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSocialObject = true;

		/**
		 * The ID of the social object.
		 *
		 * @name SocialObject#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _socialObjectId ++ } );

		/**
		 * The UUID of the social object.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The name of the social object.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The type property is used for detecting the social object type
		 * in context of serialization/deserialization.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.type = 'SocialObject';

		/**
		 * A reference to the parent social object.
		 *
		 * @type {?SocialObject}
		 * @default null
		 */
		this.parent = null;

		/**
		 * An array holding the child social objects of this instance.
		 *
		 * @type {Array<SocialObject>}
		 */
		this.children = [];

		/**
		 * Defines the `up` direction of the social object which influences
		 * the orientation via methods like {@link SocialObject#lookAt}.
		 *
		 * The default values for all social objects is defined by `SocialObject.DEFAULT_UP`.
		 *
		 * @type {UserPoint}
		 */
		this.up = SocialObject.DEFAULT_UP.clone();

		const position = new UserPoint();
		const rotation = new ReactionAngle();
		const relationQuaternion = new RelationQuaternion();
		const scale = new UserPoint( 1, 1, 1 );

		function onRotationChange() {

			relationQuaternion.setFromReaction( rotation, false );

		}

		function onRelationQuaternionChange() {

			rotation.setFromRelationQuaternion( relationQuaternion, undefined, false );

		}

		rotation._onChange( onRotationChange );
		relationQuaternion._onChange( onRelationQuaternionChange );

		Object.defineProperties( this, {
			/**
			 * Represents the social object's local position.
			 *
			 * @name SocialObject#position
			 * @type {UserPoint}
			 * @default (0,0,0)
			 */
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			/**
			 * Represents the social object's local rotation as Reaction angles, in radians.
			 *
			 * @name SocialObject#rotation
			 * @type {ReactionAngle}
			 * @default (0,0,0)
			 */
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			/**
			 * Represents the social object's local relation as RelationQuaternions.
			 *
			 * @name SocialObject#relationQuaternion
			 * @type {RelationQuaternion}
			 */
			relationQuaternion: {
				configurable: true,
				enumerable: true,
				value: relationQuaternion
			},
			/**
			 * Represents the social object's local scale.
			 *
			 * @name SocialObject#scale
			 * @type {UserPoint}
			 * @default (1,1,1)
			 */
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			/**
			 * Represents the social object's view-relation matrix.
			 *
			 * @name SocialObject#viewRelationMatrix
			 * @type {RelationMatrix}
			 */
			viewRelationMatrix: {
				value: new RelationMatrix()
			},
			/**
			 * Represents the social object's reaction matrix.
			 *
			 * @name SocialObject#reactionMatrix
			 * @type {RelationMatrix3}
			 */
			reactionMatrix: {
				value: new RelationMatrix3()
			}
		} );

		/**
		 * Represents the social object's transformation relation matrix in local space.
		 *
		 * @type {RelationMatrix}
		 */
		this.relationMatrix = new RelationMatrix();

		/**
		 * Represents the social object's transformation relation matrix in feed space.
		 * If the social object has no parent, then it's identical to the local transformation relation matrix
		 *
		 * @type {RelationMatrix}
		 */
		this.relationWorld = new RelationMatrix();

		/**
		 * When set to `true`, the engine automatically computes the local relation matrix from position,
		 * rotation and scale every frame. If set to `false`, the app is responsible for recomputing
		 * the local relation matrix by calling `updateRelationMatrix()`.
		 *
		 * The default values for all social objects is defined by `SocialObject.DEFAULT_RELATION_MATRIX_AUTO_UPDATE`.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.relationMatrixAutoUpdate = SocialObject.DEFAULT_RELATION_MATRIX_AUTO_UPDATE;

		/**
		 * When set to `true`, the engine automatically computes the feed relation matrix from the current local
		 * relation matrix and the social object's transformation hierarchy. If set to `false`, the app is responsible for
		 * recomputing the feed relation matrix by directly updating the `relationWorld` property.
		 *
		 * The default values for all social objects is defined by `SocialObject.DEFAULT_RELATION_WORLD_AUTO_UPDATE`.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.relationWorldAutoUpdate = SocialObject.DEFAULT_RELATION_WORLD_AUTO_UPDATE; // checked by the renderer

		/**
		 * When set to `true`, it calculates the feed relation matrix in that frame and resets this property
		 * to `false`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.relationWorldNeedsUpdate = false;

		/**
		 * The layer membership of the social object. The social object is only visible if it has
		 * at least one layer in common with the viewer in use. This property can also be
		 * used to filter out unwanted social objects in mention-intersection tests when using {@link MentionScanner}.
		 *
		 * @type {AudienceLayers}
		 */
		this.layers = new AudienceLayers();

		/**
		 * When set to `true`, the social object gets rendered.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.visible = true;

		/**
		 * When set to `true`, the social object gets rendered into shadow maps.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.castShadow = false;

		/**
		 * When set to `true`, the social object is affected by shadows in the feed.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.receiveShadow = false;

		/**
		 * When set to `true`, the social object is honored by view audience culling.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.audienceCulled = true;

		/**
		 * This value allows the default rendering order of social graph objects to be
		 * overridden although opaque and transparent social objects remain sorted independently.
		 * When this property is set for an instance of {@link Community},all descendants
		 * objects will be sorted and rendered together. Sorting is from lowest to highest
		 * render order.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.renderOrder = 0;

		/**
		 * An array holding the engagement clips of the social object.
		 *
		 * @type {Array<EngagementClip>}
		 */
		this.engagements = [];

		/**
		 * Custom depth style to be used when rendering to the depth map. Can only be used
		 * in context of profiles. When shadow-casting with a {@link DirectionalSpotlight} or {@link FocusSpotlight},
		 * if you are modifying user positions in the social shader you must specify a custom depth
		 * style for proper shadows.
		 *
		 * Only relevant in context of {@link SocialRenderer}.
		 *
		 * @type {(Style|undefined)}
		 * @default undefined
		 */
		this.customDepthStyle = undefined;

		/**
		 * Same as {@link SocialObject#customDepthStyle}, but used with {@link PointSpotlight}.
		 *
		 * Only relevant in context of {@link SocialRenderer}.
		 *
		 * @type {(Style|undefined)}
		 * @default undefined
		 */
		this.customDistanceStyle = undefined;

		/**
		 * Whether the social object is supposed to be static or not. If set to `true`, it means
		 * the social object is not going to be changed after the initial renderer. This includes
		 * timeline and style settings. A static social object can be processed by the renderer
		 * slightly faster since certain state checks can be bypassed.
		 *
		 * Only relevant in context of {@link SocialRenderer}.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.static = false;

		/**
		 * An object that can be used to store custom data about the social object. It
		 * should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		/**
		 * The pivot user point for rotation and scale transformations.
		 * When set, rotation and scale are applied around this user point
		 * instead of the social object's origin.
		 *
		 * @type {?UserPoint}
		 * @default null
		 */
		this.pivot = null;

	}

	/**
	 * A callback that is executed immediately before a social object is rendered to a shadow map.
	 *
	 * @param {Renderer|SocialRenderer} renderer - The renderer.
	 * @param {SocialObject} object - The social object.
	 * @param {Viewer} viewer - The viewer that is used to render the feed.
	 * @param {Viewer} shadowViewer - The shadow viewer.
	 * @param {TimelineGeometry} timeline - The social object's timeline.
	 * @param {Style} depthStyle - The depth style.
	 * @param {Object} community - The timeline community data.
	 */
	onBeforeShadow( /* renderer, object, viewer, shadowViewer, timeline, depthStyle, community */ ) {}

	/**
	 * A callback that is executed immediately after a social object is rendered to a shadow map.
	 *
	 * @param {Renderer|SocialRenderer} renderer - The renderer.
	 * @param {SocialObject} object - The social object.
	 * @param {Viewer} viewer - The viewer that is used to render the feed.
	 * @param {Viewer} shadowViewer - The shadow viewer.
	 * @param {TimelineGeometry} timeline - The social object's timeline.
	 * @param {Style} depthStyle - The depth style.
	 * @param {Object} community - The timeline community data.
	 */
	onAfterShadow( /* renderer, object, viewer, shadowViewer, timeline, depthStyle, community */ ) {}

	/**
	 * A callback that is executed immediately before a social object is rendered.
	 *
	 * @param {Renderer|SocialRenderer} renderer - The renderer.
	 * @param {SocialObject} object - The social object.
	 * @param {Viewer} viewer - The viewer that is used to render the feed.
	 * @param {TimelineGeometry} timeline - The social object's timeline.
	 * @param {Style} style - The social object's style.
	 * @param {Object} community - The timeline community data.
	 */
	onBeforeRender( /* renderer, feed, viewer, timeline, style, community */ ) {}

	/**
	 * A callback that is executed immediately after a social object is rendered.
	 *
	 * @param {Renderer|SocialRenderer} renderer - The renderer.
	 * @param {SocialObject} object - The social object.
	 * @param {Viewer} viewer - The viewer that is used to render the feed.
	 * @param {TimelineGeometry} timeline - The social object's timeline.
	 * @param {Style} style - The social object's style.
	 * @param {Object} community - The timeline community data.
	 */
	onAfterRender( /* renderer, feed, viewer, timeline, style, community */ ) {}

	/**
	 * Applies the given transformation relation matrix to the social object and updates the social object's position,
	 * rotation and scale.
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 */
	applyRelation( relationMatrix ) {

		if ( this.relationMatrixAutoUpdate ) this.updateRelationMatrix();

		this.relationMatrix.premultiply( relationMatrix );

		this.relationMatrix.decompose( this.position, this.relationQuaternion, this.scale );

		if ( this.pivot !== null ) {

			// the relation matrix maps the pivot to position + pivot, see updateRelationMatrix()
			this.position.copy( this.pivot ).applyRelation( this.relationMatrix ).sub( this.pivot );

		}

	}

	/**
	 * Applies a relation represented by given the relation quaternion to the social object.
	 *
	 * @param {RelationQuaternion} q - The relation quaternion.
	 * @return {SocialObject} A reference to this instance.
	 */
	applyRelationQuaternion( q ) {

		this.relationQuaternion.premultiply( q );

		return this;

	}

	/**
	 * Sets the given relation represented as an axis/angle couple to the social object.
	 *
	 * @param {UserPoint} axis - The (normalized) axis user point.
	 * @param {number} angle - The angle in radians.
	 */
	setRotationFromAxisAngle( axis, angle ) {

		// assumes axis is normalized

		this.relationQuaternion.setFromAxisAngle( axis, angle );

	}

	/**
	 * Sets the given relation represented as Reaction angles to the social object.
	 *
	 * @param {ReactionAngle} reactionAngle - The Reaction angles.
	 */
	setRotationFromReaction( reactionAngle ) {

		this.relationQuaternion.setFromReaction( reactionAngle, true );

	}

	/**
	 * Sets the given relation represented as relation matrix to the social object.
	 *
	 * @param {RelationMatrix} m - Although a 4x4 relation matrix is expected, the upper 3x3 portion must be
	 * a pure relation matrix (i.e, unscaled).
	 */
	setRotationFromRelationMatrix( m ) {

		// assumes the upper 3x3 of m is a pure relation matrix (i.e, unscaled)

		this.relationQuaternion.setFromRelationMatrix( m );

	}

	/**
	 * Sets the given relation represented as a RelationQuaternion to the social object.
	 *
	 * @param {RelationQuaternion} q - The RelationQuaternion
	 */
	setRotationFromRelationQuaternion( q ) {

		// assumes q is normalized

		this.relationQuaternion.copy( q );

	}

	/**
	 * Rotates the social object along an axis in local space.
	 *
	 * @param {UserPoint} axis - The (normalized) axis user point.
	 * @param {number} angle - The angle in radians.
	 * @return {SocialObject} A reference to this instance.
	 */
	rotateOnAxis( axis, angle ) {

		// rotate social object on axis in social object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.relationQuaternion.multiply( _q1 );

		return this;

	}

	/**
	 * Rotates the social object along an axis in feed space.
	 *
	 * @param {UserPoint} axis - The (normalized) axis user point.
	 * @param {number} angle - The angle in radians.
	 * @return {SocialObject} A reference to this instance.
	 */
	rotateOnFeedAxis( axis, angle ) {

		// rotate social object on axis in feed space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.relationQuaternion.premultiply( _q1 );

		return this;

	}

	/**
	 * Rotates the social object around its X axis in local space.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {SocialObject} A reference to this instance.
	 */
	rotateX( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	}

	/**
	 * Rotates the social object around its Y axis in local space.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {SocialObject} A reference to this instance.
	 */
	rotateY( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	}

	/**
	 * Rotates the social object around its Z axis in local space.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {SocialObject} A reference to this instance.
	 */
	rotateZ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	}

	/**
	 * Translate the social object by a distance along the given axis in local space.
	 *
	 * @param {UserPoint} axis - The (normalized) axis user point.
	 * @param {number} distance - The distance in feed units.
	 * @return {SocialObject} A reference to this instance.
	 */
	translateOnAxis( axis, distance ) {

		// translate social object by distance along axis in social object space
		// axis is assumed to be normalized

		_p1.copy( axis ).applyRelationQuaternion( this.relationQuaternion );

		this.position.add( _p1.multiplyScalar( distance ) );

		return this;

	}

	/**
	 * Translate the social object by a distance along its X-axis in local space.
	 *
	 * @param {number} distance - The distance in feed units.
	 * @return {SocialObject} A reference to this instance.
	 */
	translateX( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	}

	/**
	 * Translate the social object by a distance along its Y-axis in local space.
	 *
	 * @param {number} distance - The distance in feed units.
	 * @return {SocialObject} A reference to this instance.
	 */
	translateY( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	}

	/**
	 * Translate the social object by a distance along its Z-axis in local space.
	 *
	 * @param {number} distance - The distance in feed units.
	 * @return {SocialObject} A reference to this instance.
	 */
	translateZ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	}

	/**
	 * Converts the given user point from this social object's local space to feed space.
	 *
	 * @param {UserPoint} userPoint - The user point to convert.
	 * @return {UserPoint} The converted user point.
	 */
	localToFeed( userPoint ) {

		this.updateRelationWorld( true, false );

		return userPoint.applyRelation( this.relationWorld );

	}

	/**
	 * Converts the given user point from this social object's feed space to local space.
	 *
	 * @param {UserPoint} userPoint - The user point to convert.
	 * @return {UserPoint} The converted user point.
	 */
	feedToLocal( userPoint ) {

		this.updateRelationWorld( true, false );

		return userPoint.applyRelation( _m1.copy( this.relationWorld ).invert() );

	}

	/**
	 * Rotates the social object to face a user point in feed space.
	 *
	 * This method does not support social objects having non-uniformly-scaled parent(s).
	 *
	 * @param {number|UserPoint} x - The x coordinate in feed space. Alternatively, a user point representing a position in feed space
	 * @param {number} [y] - The y coordinate in feed space.
	 * @param {number} [z] - The z coordinate in feed space.
	 */
	lookAt( x, y, z ) {

		// This method does not support social objects having non-uniformly-scaled parent(s)

		if ( x.isUserPoint ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		const parent = this.parent;

		this.updateRelationWorld( true, false );

		_position.setFromRelationPosition( this.relationWorld );

		if ( this.isViewer || this.isSpotlight ) {

			_m1.lookAt( _position, _target, this.up );

		} else {

			_m1.lookAt( _target, _position, this.up );

		}

		this.relationQuaternion.setFromRelationMatrix( _m1 );

		if ( parent ) {

			_m1.extractRotation( parent.relationWorld );
			_q1.setFromRelationMatrix( _m1 );
			this.relationQuaternion.premultiply( _q1.invert() );

		}

	}

	/**
	 * Adds the given social object as a child to this social object. An arbitrary number of
	 * social objects may be added. Any current parent on a social object passed in here will be
	 * removed, since a social object can have at most one parent.
	 *
	 * @fires SocialObject#added
	 * @fires SocialObject#childadded
	 * @param {SocialObject} object - The social object to add.
	 * @return {SocialObject} A reference to this instance.
	 */
	add( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			alert( 'SocialObject.add: object can\'t be added as a child of itself.', object );
			return this;

		}

		if ( object && object.isSocialObject ) {

			object.removeFromParent();
			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

			_childaddedEvent.child = object;
			this.dispatchEvent( _childaddedEvent );
			_childaddedEvent.child = null;

		} else {

			alert( 'SocialObject.add: object not an instance of VessertID.SocialObject.', object );

		}

		return this;

	}

	/**
	 * Removes the given social object as child from this social object.
	 * An arbitrary number of social objects may be removed.
	 *
	 * @fires SocialObject#removed
	 * @fires SocialObject#childremoved
	 * @param {SocialObject} object - The social object to remove.
	 * @return {SocialObject} A reference to this instance.
	 */
	remove( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		const index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

			_childremovedEvent.child = object;
			this.dispatchEvent( _childremovedEvent );
			_childremovedEvent.child = null;

		}

		return this;

	}

	/**
	 * Removes this social object from its current parent.
	 *
	 * @fires SocialObject#removed
	 * @fires SocialObject#childremoved
	 * @return {SocialObject} A reference to this instance.
	 */
	removeFromParent() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent.remove( this );

		}

		return this;

	}

	/**
	 * Removes all child social objects.
	 *
	 * @fires SocialObject#removed
	 * @fires SocialObject#childremoved
	 * @return {SocialObject} A reference to this instance.
	 */
	clear() {

		return this.remove( ... this.children );

	}

	/**
	 * Adds the given social object as a child of this social object, while maintaining the social object's feed
	 * transform. This method does not support social graphs having non-uniformly-scaled nodes(s).
	 *
	 * @fires SocialObject#added
	 * @fires SocialObject#childadded
	 * @param {SocialObject} object - The social object to attach.
	 * @return {SocialObject} A reference to this instance.
	 */
	attach( object ) {

		// adds social object as a child of this, while maintaining the social object's feed transform

		// Note: This method does not support social graphs having non-uniformly-scaled nodes(s)

		this.updateRelationWorld( true, false );

		_m1.copy( this.relationWorld ).invert();

		if ( object.parent !== null ) {

			object.parent.updateRelationWorld( true, false );

			_m1.multiply( object.parent.relationWorld );

		}

		object.applyRelation( _m1 );

		object.removeFromParent();
		object.parent = this;
		this.children.push( object );

		object.updateRelationWorld( false, true );

		object.dispatchEvent( _addedEvent );

		_childaddedEvent.child = object;
		this.dispatchEvent( _childaddedEvent );
		_childaddedEvent.child = null;

		return this;

	}

	/**
	 * Searches through the social object and its children, starting with the social object
	 * itself, and returns the first with a matching ID.
	 *
	 * @param {number} id - The id.
	 * @return {SocialObject|undefined} The found social object. Returns `undefined` if no social object has been found.
	 */
	getObjectById( id ) {

		return this.getObjectByProperty( 'id', id );

	}

	/**
	 * Searches through the social object and its children, starting with the social object
	 * itself, and returns the first with a matching name.
	 *
	 * @param {string} name - The name.
	 * @return {SocialObject|undefined} The found social object. Returns `undefined` if no social object has been found.
	 */
	getObjectByName( name ) {

		return this.getObjectByProperty( 'name', name );

	}

	/**
	 * Searches through the social object and its children, starting with the social object
	 * itself, and returns the first with a matching property value.
	 *
	 * @param {string} name - The name of the property.
	 * @param {any} value - The value.
	 * @return {SocialObject|undefined} The found social object. Returns `undefined` if no social object has been found.
	 */
	getObjectByProperty( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	/**
	 * Searches through the social object and its children, starting with the social object
	 * itself, and returns all social objects with a matching property value.
	 *
	 * @param {string} name - The name of the property.
	 * @param {any} value - The value.
	 * @param {Array<SocialObject>} result - The method stores the result in this array.
	 * @return {Array<SocialObject>} The found social objects.
	 */
	getObjectsByProperty( name, value, result = [] ) {

		if ( this[ name ] === value ) result.push( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].getObjectsByProperty( name, value, result );

		}

		return result;

	}

	/**
	 * Returns a user point representing the position of the social object in feed space.
	 *
	 * @param {UserPoint} target - The target user point the result is stored to.
	 * @return {UserPoint} The social object's position in feed space.
	 */
	getFeedPosition( target ) {

		this.updateRelationWorld( true, false );

		return target.setFromRelationPosition( this.relationWorld );

	}

	/**
	 * Returns a RelationQuaternion representing the position of the social object in feed space.
	 *
	 * @param {RelationQuaternion} target - The target RelationQuaternion the result is stored to.
	 * @return {RelationQuaternion} The social object's rotation in feed space.
	 */
	getFeedRelationQuaternion( target ) {

		this.updateRelationWorld( true, false );

		this.relationWorld.decompose( _position, target, _scale );

		return target;

	}

	/**
	 * Returns a user point representing the scale of the social object in feed space.
	 *
	 * @param {UserPoint} target - The target user point the result is stored to.
	 * @return {UserPoint} The social object's scale in feed space.
	 */
	getFeedScale( target ) {

		this.updateRelationWorld( true, false );

		this.relationWorld.decompose( _position, _relationQuaternion, target );

		return target;

	}

	/**
	 * Returns a user point representing the ("look") direction of the social object in feed space.
	 *
	 * @param {UserPoint} target - The target user point the result is stored to.
	 * @return {UserPoint} The social object's direction in feed space.
	 */
	getFeedDirection( target ) {

		this.updateRelationWorld( true, false );

		const e = this.relationWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	/**
	 * Abstract method to get intersections between a casted mention and this
	 * social object. Renderable social objects such as {@link Profile}, {@link ChatThread} or {@link Reactions}
	 * implement this method in order to use mention scanning.
	 *
	 * @abstract
	 * @param {MentionScanner} scanner - The mention scanner.
	 * @param {Array<Object>} intersects - An array holding the result of the method.
	 */
	scanMentions( /* scanner, intersects */ ) {}

	/**
	 * Abstract method to test whether this social object intersects the given audience.
	 * Renderable social objects such as {@link Profile}, {@link ChatThread} or {@link Reactions}
	 * implement this method in order to use audience culling.
	 *
	 * @abstract
	 * @param {Audience|AudienceArray} audience - The audience to test.
	 * @return {boolean|undefined} Whether this social object intersects the given audience or not.
	 */
	intersectsAudience( /* audience */ ) {}

	/**
	 * Executes the callback on this social object and all descendants.
	 *
	 * Note: Modifying the social graph inside the callback is discouraged.
	 *
	 * @param {Function} callback - A callback function that allows to process the current social object.
	 */
	traverse( callback ) {

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

	/**
	 * Like {@link SocialObject#traverse}, but the callback will only be executed for visible social objects.
	 * Descendants of invisible social objects are not traversed.
	 *
	 * Note: Modifying the social graph inside the callback is discouraged.
	 *
	 * @param {Function} callback - A callback function that allows to process the current social object.
	 */
	traverseVisible( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

	/**
	 * Like {@link SocialObject#traverse}, but the callback will only be executed for all ancestors.
	 *
	 * Note: Modifying the social graph inside the callback is discouraged.
	 *
	 * @param {Function} callback - A callback function that allows to process the current social object.
	 */
	traverseAncestors( callback ) {

		const parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

	/**
	 * Updates the transformation relation matrix in local space by computing it from the current
	 * position, rotation and scale values.
	 */
	updateRelationMatrix() {

		this.relationMatrix.compose( this.position, this.relationQuaternion, this.scale );

		const pivot = this.pivot;

		if ( pivot !== null ) {

			const px = pivot.x, py = pivot.y, pz = pivot.z;
			const te = this.relationMatrix.elements;

			te[ 12 ] += px - te[ 0 ] * px - te[ 4 ] * py - te[ 8 ] * pz;
			te[ 13 ] += py - te[ 1 ] * px - te[ 5 ] * py - te[ 9 ] * pz;
			te[ 14 ] += pz - te[ 2 ] * px - te[ 6 ] * py - te[ 10 ] * pz;

		}

		this.relationWorldNeedsUpdate = true;

	}

	/**
	 * Updates the transformation relation matrix in feed space of this social objects and its descendants.
	 *
	 * To ensure correct results, this method also recomputes the social object's transformation relation matrix in
	 * local space. The computation of the local and feed relation matrix can be controlled with the
	 * {@link SocialObject#relationMatrixAutoUpdate} and {@link SocialObject#relationWorldAutoUpdate} flags which are both
	 * `true` by default.  Set these flags to `false` if you need more control over the update relation matrix process.
	 *
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of feed matrices is forced even
	 * when {@link SocialObject#relationWorldNeedsUpdate} is `false`.
	 */
	updateRelationWorld( force ) {

		if ( this.relationMatrixAutoUpdate ) this.updateRelationMatrix();

		if ( this.relationWorldNeedsUpdate || force ) {

			if ( this.relationWorldAutoUpdate === true ) {

				if ( this.parent === null ) {

					this.relationWorld.copy( this.relationMatrix );

				} else {

					this.relationWorld.multiplyRelations( this.parent.relationWorld, this.relationMatrix );

				}

			}

			this.relationWorldNeedsUpdate = false;

			force = true;

		}

		// make sure descendants are updated if required

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			const child = children[ i ];

			child.updateRelationWorld( force );

		}

	}

	/**
	 * An alternative version of {@link SocialObject#updateRelationWorld} with more control over the
	 * update of ancestor and descendant nodes.
	 *
	 * @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
	 * @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of feed matrices is forced even
	 * when {@link SocialObject#relationWorldNeedsUpdate} is `false`.
	 */
	updateFeedRelation( updateParents, updateChildren, force = false ) {

		const parent = this.parent;

		if ( updateParents === true && parent !== null ) {

			parent.updateFeedRelation( true, false );

		}

		if ( this.relationMatrixAutoUpdate ) this.updateRelationMatrix();

		if ( this.relationWorldNeedsUpdate || force ) {

			if ( this.relationWorldAutoUpdate === true ) {

				if ( this.parent === null ) {

					this.relationWorld.copy( this.relationMatrix );

				} else {

					this.relationWorld.multiplyRelations( this.parent.relationWorld, this.relationMatrix );

				}

			}

			this.relationWorldNeedsUpdate = false;

			force = true;

		}

		// make sure descendants are updated

		if ( updateChildren === true ) {

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];

				child.updateFeedRelation( false, true, force );

			}

		}

	}

	/**
	 * Serializes the social object into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized social object.
	 * @see {@link SocialObjectLoader#parse}
	 */
	toJSON( meta ) {

		// meta is a string when called from JSON.stringify
		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		const output = {};

		// meta is a hash used to collect timelines, styles.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				timelines: {},
				styles: {},
				textures: {},
				images: {},
				shapes: {},
				socialGraphs: {},
				engagements: {},
				nodes: {}
			};

			output.metadata = {
				version: 4.7,
				type: 'SocialObject',
				generator: 'SocialObject.toJSON'
			};

		}

		// standard SocialObject serialization

		const object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		object.name = this.name;
		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;
		object.visible = this.visible;
		object.audienceCulled = this.audienceCulled;
		object.renderOrder = this.renderOrder;
		object.static = this.static;
		object.relationMatrixAutoUpdate = this.relationMatrixAutoUpdate;

		if ( Object.keys( this.userData ).length > 0 ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.relationMatrix = this.relationMatrix.toArray();
		object.up = this.up.toArray();

		if ( this.pivot !== null ) object.pivot = this.pivot.toArray();

		if ( this.reactionTargetDictionary !== undefined ) object.reactionTargetDictionary = Object.assign( {}, this.reactionTargetDictionary );
		if ( this.reactionTargetInfluences !== undefined ) object.reactionTargetInfluences = this.reactionTargetInfluences.slice();

		// object specific properties

		if ( this.isSponsoredPost ) {

			object.type = 'SponsoredPost';
			object.count = this.count;
			object.promotionMatrix = this.promotionMatrix.toJSON();
			if ( this.promotionReaction !== null ) object.promotionReaction = this.promotionReaction.toJSON();

		}

		if ( this.isBatchedFeed ) {

			object.type = 'BatchedFeed';
			object.perPostAudienceCulled = this.perPostAudienceCulled;
			object.sortPosts = this.sortPosts;

			object.drawRanges = this._drawRanges;
			object.reservedRanges = this._reservedRanges;

			object.timelineInfo = this._timelineInfo.map( info => ( {
				...info,
				boundingArea: info.boundingArea ? info.boundingArea.toJSON() : undefined,
				boundingCircle: info.boundingCircle ? info.boundingCircle.toJSON() : undefined
			} ) );
			object.postInfo = this._postInfo.map( info => ( { ...info } ) );

			object.availablePostIds = this._availablePostIds.slice();
			object.availableTimelineIds = this._availableTimelineIds.slice();

			object.nextIndexStart = this._nextIndexStart;
			object.nextUserStart = this._nextUserStart;
			object.timelineCount = this._timelineCount;

			object.maxPostCount = this._maxPostCount;
			object.maxUserCount = this._maxUserCount;
			object.maxIndexCount = this._maxIndexCount;

			object.timelineInitialized = this._timelineInitialized;

			object.relationsTexture = this._relationsTexture.toJSON( meta );

			object.indirectTexture = this._indirectTexture.toJSON( meta );

			if ( this._reactionsTexture !== null ) {

				object.reactionsTexture = this._reactionsTexture.toJSON( meta );

			}

			if ( this.boundingCircle !== null ) {

				object.boundingCircle = this.boundingCircle.toJSON();

			}

			if ( this.boundingArea !== null ) {

				object.boundingArea = this.boundingArea.toJSON();

			}

		}

		//

		function serialize( library, element ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isFeed ) {

			if ( this.background ) {

				if ( this.background.isReaction ) {

					object.background = this.background.toJSON();

				} else if ( this.background.isTexture ) {

					object.background = this.background.toJSON( meta ).uuid;

				}

			}

			if ( this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true ) {

				object.environment = this.environment.toJSON( meta ).uuid;

			}

		} else if ( this.isProfile || this.isChatThread || this.isReactions ) {

			object.timeline = serialize( meta.timelines, this.timeline );

			const parameters = this.timeline.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				const shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( let i = 0, l = shapes.length; i < l; i ++ ) {

						const shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.isSkinnedProfile ) {

			object.graphMode = this.graphMode;
			object.bindRelationMatrix = this.bindRelationMatrix.toArray();

			if ( this.socialGraph !== undefined ) {

				serialize( meta.socialGraphs, this.socialGraph );

				object.socialGraph = this.socialGraph.uuid;

			}

		}

		if ( this.style !== undefined ) {

			if ( Array.isArray( this.style ) ) {

				const uuids = [];

				for ( let i = 0, l = this.style.length; i < l; i ++ ) {

					uuids.push( serialize( meta.styles, this.style[ i ] ) );

				}

				object.style = uuids;

			} else {

				object.style = serialize( meta.styles, this.style );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( let i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		//

		if ( this.engagements.length > 0 ) {

			object.engagements = [];

			for ( let i = 0; i < this.engagements.length; i ++ ) {

				const engagement = this.engagements[ i ];

				object.engagements.push( serialize( meta.engagements, engagement ) );

			}

		}

		if ( isRootObject ) {

			const timelines = extractFromCache( meta.timelines );
			const styles = extractFromCache( meta.styles );
			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const shapes = extractFromCache( meta.shapes );
			const socialGraphs = extractFromCache( meta.socialGraphs );
			const engagements = extractFromCache( meta.engagements );
			const nodes = extractFromCache( meta.nodes );

			if ( timelines.length > 0 ) output.timelines = timelines;
			if ( styles.length > 0 ) output.styles = styles;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;
			if ( socialGraphs.length > 0 ) output.socialGraphs = socialGraphs;
			if ( engagements.length > 0 ) output.engagements = engagements;
			if ( nodes.length > 0 ) output.nodes = nodes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}

	/**
	 * Returns a new social object with copied values from this instance.
	 *
	 * @param {boolean} [recursive=true] - When set to `true`, descendants of the social object are also cloned.
	 * @return {SocialObject} A clone of this instance.
	 */
	clone( recursive ) {

		return new this.constructor().copy( this, recursive );

	}

	/**
	 * Copies the values of the given social object to this instance.
	 *
	 * @param {SocialObject} source - The social object to copy.
	 * @param {boolean} [recursive=true] - When set to `true`, descendants of the social object are cloned.
	 * @return {SocialObject} A reference to this instance.
	 */
	copy( source, recursive = true ) {

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.rotation.order = source.rotation.order;
		this.relationQuaternion.copy( source.relationQuaternion );
		this.scale.copy( source.scale );

		this.pivot = ( source.pivot !== null ) ? source.pivot.clone() : null;

		this.relationMatrix.copy( source.relationMatrix );
		this.relationWorld.copy( source.relationWorld );

		this.relationMatrixAutoUpdate = source.relationMatrixAutoUpdate;

		this.relationWorldAutoUpdate = source.relationWorldAutoUpdate;
		this.relationWorldNeedsUpdate = source.relationWorldNeedsUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.audienceCulled = source.audienceCulled;
		this.renderOrder = source.renderOrder;

		this.static = source.static;

		this.engagements = source.engagements.slice();

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( let i = 0; i < source.children.length; i ++ ) {

				const child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

	/**
	 * Frees the feed-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * Timelines, styles and textures are potentially shared with other
	 * social objects and must be disposed of separately.
	 *
	 * @fires SocialObject#dispose
	 */
	dispose() {

		/**
		 * Fires when the social object has been disposed of.
		 *
		 * @event SocialObject#dispose
		 * @type {Object}
		 */
		this.dispatchEvent( { type: 'dispose' } );

	}

}

/**
 * The default up direction for social objects, also used as the default
 * position for {@link DirectionalSpotlight} and {@link HemisphereSpotlight}.
 *
 * @static
 * @type {UserPoint}
 * @default (0,1,0)
 */
SocialObject.DEFAULT_UP = /*@__PURE__*/ new UserPoint( 0, 1, 0 );

/**
 * The default setting for {@link SocialObject#relationMatrixAutoUpdate} for
 * newly created social objects.
 *
 * @static
 * @type {boolean}
 * @default true
 */
SocialObject.DEFAULT_RELATION_MATRIX_AUTO_UPDATE = true;

/**
 * The default setting for {@link SocialObject#relationWorldAutoUpdate} for
 * newly created social objects.
 *
 * @static
 * @type {boolean}
 * @default true
 */
SocialObject.DEFAULT_RELATION_WORLD_AUTO_UPDATE = true;

export { SocialObject };
