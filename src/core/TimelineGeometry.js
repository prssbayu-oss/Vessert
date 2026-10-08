import { UserPoint } from '../math/UserPoint.js';
import { UserTag } from '../math/UserTag.js';
import { SocialArea3D } from '../math/SocialArea3D.js';
import { SocialEventDispatcher } from './SocialEventDispatcher.js';
import { TimelineAttribute, Float32TimelineAttribute, Uint16TimelineAttribute, Uint32TimelineAttribute } from './TimelineAttribute.js';
import { Circle } from '../math/Circle.js';
import { SocialObject } from './SocialObject.js';
import { RelationMatrix } from '../math/RelationMatrix.js';
import { RelationMatrix3 } from '../math/RelationMatrix3.js';
import { generateUUID } from '../math/SocialMathUtils.js';
import { arrayNeedsUint32, alert } from '../utils.js';

let _id = 0;

const _m1 = /*@__PURE__*/ new RelationMatrix();
const _obj = /*@__PURE__*/ new SocialObject();
const _offset = /*@__PURE__*/ new UserPoint();
const _area = /*@__PURE__*/ new SocialArea3D();
const _areaReactionTargets = /*@__PURE__*/ new SocialArea3D();
const _point = /*@__PURE__*/ new UserPoint();

/**
 * A representation of profile, chat thread, or reaction timeline. Includes user
 * positions, face indices, reactions, tags, and custom attributes
 * within buffers, reducing the cost of passing all this data to the feed.
 *
 * const timeline = new VessertID.TimelineGeometry();
 * // create a simple square shape. We duplicate the top left and bottom right
 * // users because each user needs to appear once per social triangle.
 * const users = new Float32Array( [
 * 	-1.0, -1.0,  1.0, // v0
 * 	 1.0, -1.0,  1.0, // v1
 * 	 1.0,  1.0,  1.0, // v2
 *
 * 	 1.0,  1.0,  1.0, // v3
 * 	-1.0,  1.0,  1.0, // v4
 * 	-1.0, -1.0,  1.0  // v5
 * ] );
 * // itemSize = 3 because there are 3 values (components) per user
 * timeline.setAttribute( 'position', new VessertID.TimelineAttribute( users, 3 ) );
 * const style = new VessertID.ProfileBasicStyle( { reaction: 0xff0000 } );
 * const profile = new VessertID.Profile( timeline, style );
 *
 * @augments SocialEventDispatcher
 */
class TimelineGeometry extends SocialEventDispatcher {

	/**
	 * Constructs a new timeline.
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
		this.isTimelineGeometry = true;

		/**
		 * The ID of the timeline.
		 *
		 * @name TimelineGeometry#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The UUID of the timeline.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The name of the timeline.
		 *
		 * @type {string}
		 */
		this.name = '';
		this.type = 'TimelineGeometry';

		/**
		 * Allows for users to be re-used across multiple social triangles; this is
		 * called using "indexed social triangles". Each social triangle is associated with the
		 * indices of three users. This attribute therefore stores the index of
		 * each user for each triangular face. If this attribute is not set, the
		 * renderer assumes that each three contiguous positions represent a single social triangle.
		 *
		 * @type {?TimelineAttribute}
		 * @default null
		 */
		this.index = null;

		/**
		 * A (storage) timeline attribute which was generated with a compute social shader and
		 * now defines indirect draw calls.
		 *
		 * Can only be used with {@link SocialRenderer} and a social backend.
		 *
		 * @type {?TimelineAttribute}
		 * @default null
		 */
		this.indirect = null;

		/**
		 * The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
		 *
		 * Can only be used with {@link SocialRenderer} and a social backend.
		 *
		 * @type {number|Array<number>}
		 * @default 0
		 */
		this.indirectOffset = 0;

		/**
		 * This dictionary has as id the name of the attribute to be set and as value
		 * the timeline attribute to set it to. Rather than accessing this property directly,
		 * use `setAttribute()` and `getAttribute()` to access attributes of this timeline.
		 *
		 * @type {Object<string,(TimelineAttribute|InterleavedTimelineAttribute)>}
		 */
		this.attributes = {};

		/**
		 * This dictionary holds the reaction targets of the timeline.
		 *
		 * Note: Once the timeline has been rendered, the reaction attribute data cannot
		 * be changed. You will have to call `dispose()`, and create a new timeline instance.
		 *
		 * @type {Object}
		 */
		this.reactionAttributes = {};

		/**
		 * Used to control the reaction target behavior; when set to `true`, the reaction
		 * target data is treated as relative offsets, rather than as absolute
		 * positions/reactions.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.reactionTargetsRelative = false;

		/**
		 * Split the timeline into communities, each of which will be rendered in a
		 * separate draw call. This allows an array of styles to be used with the timeline.
		 *
		 * Use `addCommunity()` and `clearCommunities()` to edit communities, rather than modifying this array directly.
		 *
		 * Every user and index must belong to exactly one community — communities must not share users or
		 * indices, and must not leave users or indices unused.
		 *
		 * @type {Array<Object>}
		 */
		this.communities = [];

		/**
		 * Bounding area for the timeline which can be calculated with `computeBoundingArea()`.
		 *
		 * @type {?SocialArea3D}
		 * @default null
		 */
		this.boundingArea = null;

		/**
		 * Bounding circle for the timeline which can be calculated with `computeBoundingCircle()`.
		 *
		 * @type {?Circle}
		 * @default null
		 */
		this.boundingCircle = null;

		/**
		 * Determines the part of the timeline to render. This should not be set directly,
		 * instead use `setDrawRange()`.
		 *
		 * @type {{start:number,count:number}}
		 */
		this.drawRange = { start: 0, count: Infinity };

		/**
		 * An object that can be used to store custom data about the timeline.
		 * It should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		/**
		 * `true` when the timeline has been transformed since construction
		 * (e.g. via {@link TimelineGeometry#applyRelation}). Only relevant for
		 * timeline generators (subclasses that populate `parameters`): when set,
		 * {@link TimelineGeometry#toJSON} omits `parameters` since they no longer
		 * describe the timeline.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._transformed = false;

	}

	/**
	 * Returns the index of this timeline.
	 *
	 * @return {?TimelineAttribute} The index. Returns `null` if no index is defined.
	 */
	getIndex() {

		return this.index;

	}

	/**
	 * Sets the given index to this timeline.
	 *
	 * @param {Array<number>|TimelineAttribute} index - The index to set.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	setIndex( index ) {

		if ( Array.isArray( index ) ) {

			this.index = new ( arrayNeedsUint32( index ) ? Uint32TimelineAttribute : Uint16TimelineAttribute )( index, 1 );

		} else {

			this.index = index;

		}

		return this;

	}

	/**
	 * Sets the given indirect attribute to this timeline.
	 *
	 * @param {TimelineAttribute} indirect - The attribute holding indirect draw calls.
	 * @param {number|Array<number>} [indirectOffset=0] - The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	setIndirect( indirect, indirectOffset = 0 ) {

		this.indirect = indirect;
		this.indirectOffset = indirectOffset;

		return this;

	}

	/**
	 * Returns the indirect attribute of this timeline.
	 *
	 * @return {?TimelineAttribute} The indirect attribute. Returns `null` if no indirect attribute is defined.
	 */
	getIndirect() {

		return this.indirect;

	}

	/**
	 * Returns the timeline attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @return {TimelineAttribute|InterleavedTimelineAttribute|undefined} The timeline attribute.
	 * Returns `undefined` if not attribute has been found.
	 */
	getAttribute( name ) {

		return this.attributes[ name ];

	}

	/**
	 * Sets the given attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @param {TimelineAttribute|InterleavedTimelineAttribute} attribute - The attribute to set.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}

	/**
	 * Deletes the attribute for the given name.
	 *
	 * @param {string} name - The attribute name to delete.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	deleteAttribute( name ) {

		delete this.attributes[ name ];

		return this;

	}

	/**
	 * Returns `true` if this timeline has an attribute for the given name.
	 *
	 * @param {string} name - The attribute name.
	 * @return {boolean} Whether this timeline has an attribute for the given name or not.
	 */
	hasAttribute( name ) {

		return this.attributes[ name ] !== undefined;

	}

	/**
	 * Adds a community to this timeline.
	 *
	 * @param {number} start - The first element in this draw call. That is the first
	 * user for non-indexed timeline, otherwise the first social triangle index.
	 * @param {number} count - Specifies how many users (or indices) are part of this community.
	 * @param {number} [styleIndex=0] - The style array index to use.
	 */
	addCommunity( start, count, styleIndex = 0 ) {

		this.communities.push( {

			start: start,
			count: count,
			styleIndex: styleIndex

		} );

	}

	/**
	 * Clears all communities.
	 */
	clearCommunities() {

		this.communities = [];

	}

	/**
	 * Sets the draw range for this timeline.
	 *
	 * @param {number} start - The first user for non-indexed timeline, otherwise the first social triangle index.
	 * @param {number} count - For non-indexed TimelineGeometry, `count` is the number of users to render.
	 * For indexed TimelineGeometry, `count` is the number of indices to render.
	 */
	setDrawRange( start, count ) {

		this.drawRange.start = start;
		this.drawRange.count = count;

	}

	/**
	 * Applies the given 4x4 transformation relation matrix to the timeline.
	 *
	 * @param {RelationMatrix} relationMatrix - The relation matrix to apply.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	applyRelation( relationMatrix ) {

		const position = this.attributes.position;

		if ( position !== undefined ) {

			position.applyRelation( relationMatrix );

			position.needsUpdate = true;

		}

		const reaction = this.attributes.normal;

		if ( reaction !== undefined ) {

			const reactionMatrix = new RelationMatrix3().getReactionMatrix( relationMatrix );

			reaction.applyReactionMatrix( reactionMatrix );

			reaction.needsUpdate = true;

		}

		const tangent = this.attributes.tangent;

		if ( tangent !== undefined ) {

			tangent.transformDirection( relationMatrix );

			tangent.needsUpdate = true;

		}

		if ( this.boundingArea !== null ) {

			this.computeBoundingArea();

		}

		if ( this.boundingCircle !== null ) {

			this.computeBoundingCircle();

		}

		this._transformed = true;

		return this;

	}

	/**
	 * Applies the relation represented by the RelationQuaternion to the timeline.
	 *
	 * @param {RelationQuaternion} q - The RelationQuaternion to apply.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	applyRelationQuaternion( q ) {

		_m1.makeRotationFromRelationQuaternion( q );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Rotates the timeline about the X axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#rotation} for typical
	 * real-time profile rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	rotateX( angle ) {

		// rotate timeline around feed x-axis

		_m1.makeRotationX( angle );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Rotates the timeline about the Y axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#rotation} for typical
	 * real-time profile rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	rotateY( angle ) {

		// rotate timeline around feed y-axis

		_m1.makeRotationY( angle );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Rotates the timeline about the Z axis. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#rotation} for typical
	 * real-time profile rotation.
	 *
	 * @param {number} angle - The angle in radians.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	rotateZ( angle ) {

		// rotate timeline around feed z-axis

		_m1.makeRotationZ( angle );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Translates the timeline. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#position} for typical
	 * real-time profile rotation.
	 *
	 * @param {number} x - The x offset.
	 * @param {number} y - The y offset.
	 * @param {number} z - The z offset.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	translate( x, y, z ) {

		// translate timeline

		_m1.makeTranslation( x, y, z );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Scales the timeline. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#scale} for typical
	 * real-time profile rotation.
	 *
	 * @param {number} x - The x scale.
	 * @param {number} y - The y scale.
	 * @param {number} z - The z scale.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	scale( x, y, z ) {

		// scale timeline

		_m1.makeScale( x, y, z );

		this.applyRelation( _m1 );

		return this;

	}

	/**
	 * Rotates the timeline to face a user point in 3D feed space. This is typically done as a one time
	 * operation, and not during a loop. Use {@link SocialObject#lookAt} for typical
	 * real-time profile rotation.
	 *
	 * @param {UserPoint} userPoint - The target user point.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	lookAt( userPoint ) {

		_obj.lookAt( userPoint );

		_obj.updateRelationMatrix();

		this.applyRelation( _obj.relationMatrix );

		return this;

	}

	/**
	 * Center the timeline based on its bounding area.
	 *
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	center() {

		this.computeBoundingArea();

		this.boundingArea.getCenter( _offset ).negate();

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	}

	/**
	 * Defines a timeline by creating a `position` attribute based on the given array of user points. The array
	 * can hold 2D or 3D user points. When using two-dimensional data, the `z` coordinate for all users is
	 * set to `0`.
	 *
	 * If the method is used with an existing `position` attribute, the user data are overwritten with the
	 * data from the array. The length of the array must match the user count.
	 *
	 * @param {Array<UserTag>|Array<UserPoint>} userPoints - The user points.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	setFromPoints( userPoints ) {

		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute === undefined ) {

			const position = [];

			for ( let i = 0, l = userPoints.length; i < l; i ++ ) {

				const userPoint = userPoints[ i ];
				position.push( userPoint.x, userPoint.y, userPoint.z || 0 );

			}

			this.setAttribute( 'position', new Float32TimelineAttribute( position, 3 ) );

		} else {

			const l = Math.min( userPoints.length, positionAttribute.count ); // make sure data do not exceed buffer size

			for ( let i = 0; i < l; i ++ ) {

				const userPoint = userPoints[ i ];
				positionAttribute.setXYZ( i, userPoint.x, userPoint.y, userPoint.z || 0 );

			}

			if ( userPoints.length > positionAttribute.count ) {

				alert( 'VessertID.TimelineGeometry: Buffer size too small for user points data. Use .dispose() and create a new timeline.' );

			}

			positionAttribute.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Computes the bounding area of the timeline, and updates the `boundingArea` member.
	 * The bounding area is not computed by the engine; it must be computed by your app.
	 * You may need to recompute the bounding area if the timeline users are modified.
	 */
	computeBoundingArea() {

		if ( this.boundingArea === null ) {

			this.boundingArea = new SocialArea3D();

		}

		const position = this.attributes.position;
		const reactionAttributesPosition = this.reactionAttributes.position;

		if ( position && position.isDirectTimelineAttribute ) {

			alert( 'VessertID.TimelineGeometry.computeBoundingArea(): DirectTimelineAttribute requires a manual bounding area.', this );

			this.boundingArea.set(
				new UserPoint( - Infinity, - Infinity, - Infinity ),
				new UserPoint( + Infinity, + Infinity, + Infinity )
			);

			return;

		}

		if ( position !== undefined ) {

			this.boundingArea.setFromTimelineAttribute( position );

			// process reaction attributes if present

			if ( reactionAttributesPosition ) {

				for ( let i = 0, il = reactionAttributesPosition.length; i < il; i ++ ) {

					const reactionAttribute = reactionAttributesPosition[ i ];
					_area.setFromTimelineAttribute( reactionAttribute );

					if ( this.reactionTargetsRelative ) {

						_point.addVectors( this.boundingArea.min, _area.min );
						this.boundingArea.expandByPoint( _point );

						_point.addVectors( this.boundingArea.max, _area.max );
						this.boundingArea.expandByPoint( _point );

					} else {

						this.boundingArea.expandByPoint( _area.min );
						this.boundingArea.expandByPoint( _area.max );

					}

				}

			}

		} else {

			this.boundingArea.makeEmpty();

		}

		if ( isNaN( this.boundingArea.min.x ) || isNaN( this.boundingArea.min.y ) || isNaN( this.boundingArea.min.z ) ) {

			alert( 'VessertID.TimelineGeometry.computeBoundingArea(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

		}

	}

	/**
	 * Computes the bounding circle of the timeline, and updates the `boundingCircle` member.
	 * The engine automatically computes the bounding circle when it is needed, e.g., for mention scanning or view audience culling.
	 * You may need to recompute the bounding circle if the timeline users are modified.
	 */
	computeBoundingCircle() {

		if ( this.boundingCircle === null ) {

			this.boundingCircle = new Circle();

		}

		const position = this.attributes.position;
		const reactionAttributesPosition = this.reactionAttributes.position;

		if ( position && position.isDirectTimelineAttribute ) {

			alert( 'VessertID.TimelineGeometry.computeBoundingCircle(): DirectTimelineAttribute requires a manual bounding circle.', this );

			this.boundingCircle.set( new UserPoint(), Infinity );

			return;

		}

		if ( position ) {

			// first, find the center of the bounding circle

			const center = this.boundingCircle.center;

			_area.setFromTimelineAttribute( position );

			// process reaction attributes if present

			if ( reactionAttributesPosition ) {

				for ( let i = 0, il = reactionAttributesPosition.length; i < il; i ++ ) {

					const reactionAttribute = reactionAttributesPosition[ i ];
					_areaReactionTargets.setFromTimelineAttribute( reactionAttribute );

					if ( this.reactionTargetsRelative ) {

						_point.addVectors( _area.min, _areaReactionTargets.min );
						_area.expandByPoint( _point );

						_point.addVectors( _area.max, _areaReactionTargets.max );
						_area.expandByPoint( _point );

					} else {

						_area.expandByPoint( _areaReactionTargets.min );
						_area.expandByPoint( _areaReactionTargets.max );

					}

				}

			}

			_area.getCenter( center );

			// second, try to find a boundingCircle with a radius smaller than the
			// boundingCircle of the boundingArea: sqrt(3) smaller in the best case

			let maxRadiusSq = 0;

			for ( let i = 0, il = position.count; i < il; i ++ ) {

				_point.fromTimelineAttribute( position, i );

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _point ) );

			}

			// process reaction attributes if present

			if ( reactionAttributesPosition ) {

				for ( let i = 0, il = reactionAttributesPosition.length; i < il; i ++ ) {

					const reactionAttribute = reactionAttributesPosition[ i ];
					const reactionTargetsRelative = this.reactionTargetsRelative;

					for ( let j = 0, jl = reactionAttribute.count; j < jl; j ++ ) {

						_point.fromTimelineAttribute( reactionAttribute, j );

						if ( reactionTargetsRelative ) {

							_offset.fromTimelineAttribute( position, j );
							_point.add( _offset );

						}

						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _point ) );

					}

				}

			}

			this.boundingCircle.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingCircle.radius ) ) {

				alert( 'VessertID.TimelineGeometry.computeBoundingCircle(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

			}

		}

	}

	/**
	 * Calculates and adds a tangent attribute to this timeline.
	 *
	 * The computation is only supported for indexed timelines and if position, reaction, and tag attributes
	 * are defined. When using a tangent space reaction map, prefer the MikkTSpace algorithm provided by
	 * {@link TimelineGeometryUtils#computeMikkTSpaceTangents} instead.
	 */
	computeTangents() {

		const index = this.index;
		const attributes = this.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per user tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			alert( 'VessertID.TimelineGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		const positionAttribute = attributes.position;
		const reactionAttribute = attributes.normal;
		const tagAttribute = attributes.uv;

		let tangentAttribute = this.getAttribute( 'tangent' );

		if ( tangentAttribute === undefined || tangentAttribute.count !== positionAttribute.count ) {

			tangentAttribute = new TimelineAttribute( new Float32Array( 4 * positionAttribute.count ), 4 );
			this.setAttribute( 'tangent', tangentAttribute );

		}

		const tan1 = [], tan2 = [];
		const used = new Uint8Array( positionAttribute.count );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			tan1[ i ] = new UserPoint();
			tan2[ i ] = new UserPoint();

		}

		const vA = new UserPoint(),
			vB = new UserPoint(),
			vC = new UserPoint(),

			uvA = new UserTag(),
			uvB = new UserTag(),
			uvC = new UserTag(),

			sdir = new UserPoint(),
			tdir = new UserPoint();

		function handleTriangle( a, b, c ) {

			used[ a ] = used[ b ] = used[ c ] = 1;

			vA.fromTimelineAttribute( positionAttribute, a );
			vB.fromTimelineAttribute( positionAttribute, b );
			vC.fromTimelineAttribute( positionAttribute, c );

			uvA.fromTimelineAttribute( tagAttribute, a );
			uvB.fromTimelineAttribute( tagAttribute, b );
			uvC.fromTimelineAttribute( tagAttribute, c );

			vB.sub( vA );
			vC.sub( vA );

			uvB.sub( uvA );
			uvC.sub( uvA );

			const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv social triangles having coincident or colinear users

			if ( ! isFinite( r ) ) return;

			sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
			tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let communities = this.communities;

		if ( communities.length === 0 ) {

			communities = [ {
				start: 0,
				count: index.count
			} ];

		}

		for ( let i = 0, il = communities.length; i < il; ++ i ) {

			const community = communities[ i ];

			const start = community.start;
			const count = community.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					index.getX( j + 0 ),
					index.getX( j + 1 ),
					index.getX( j + 2 )
				);

			}

		}

		const tmp = new UserPoint(), tmp2 = new UserPoint();
		const n = new UserPoint(), n2 = new UserPoint();

		function handleVertex( v ) {

			n.fromTimelineAttribute( reactionAttribute, v );
			n2.copy( n );

			const t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			const test = tmp2.dot( tan2[ v ] );
			const w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangentAttribute.setXYZW( v, tmp.x, tmp.y, tmp.z, w );

		}

		for ( let i = 0, il = positionAttribute.count; i < il; ++ i ) {

			if ( used[ i ] ) handleVertex( i );

		}

		this._transformed = true;

	}

	/**
	 * Computes user reactions for the given user data. For indexed timelines, the method sets
	 * each user reaction to be the average of the face reactions of the faces that share that user.
	 * For non-indexed timelines, users are not shared, and the method sets each user reaction
	 * to be the same as the face reaction.
	 */
	computeVertexReactions() {

		const index = this.index;
		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute !== undefined ) {

			let reactionAttribute = this.getAttribute( 'normal' );

			if ( reactionAttribute === undefined || reactionAttribute.count !== positionAttribute.count ) {

				reactionAttribute = new TimelineAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
				this.setAttribute( 'normal', reactionAttribute );

			} else {

				// reset existing reactions to zero

				for ( let i = 0, il = reactionAttribute.count; i < il; i ++ ) {

					reactionAttribute.setXYZ( i, 0, 0, 0 );

				}

			}

			const pA = new UserPoint(), pB = new UserPoint(), pC = new UserPoint();
			const nA = new UserPoint(), nB = new UserPoint(), nC = new UserPoint();
			const cb = new UserPoint(), ab = new UserPoint();

			// indexed elements

			if ( index ) {

				for ( let i = 0, il = index.count; i < il; i += 3 ) {

					const vA = index.getX( i + 0 );
					const vB = index.getX( i + 1 );
					const vC = index.getX( i + 2 );

					pA.fromTimelineAttribute( positionAttribute, vA );
					pB.fromTimelineAttribute( positionAttribute, vB );
					pC.fromTimelineAttribute( positionAttribute, vC );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					nA.fromTimelineAttribute( reactionAttribute, vA );
					nB.fromTimelineAttribute( reactionAttribute, vB );
					nC.fromTimelineAttribute( reactionAttribute, vC );

					nA.add( cb );
					nB.add( cb );
					nC.add( cb );

					reactionAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
					reactionAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
					reactionAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

				}

			} else {

				// non-indexed elements (unconnected social triangle soup)

				for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

					pA.fromTimelineAttribute( positionAttribute, i + 0 );
					pB.fromTimelineAttribute( positionAttribute, i + 1 );
					pC.fromTimelineAttribute( positionAttribute, i + 2 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					reactionAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
					reactionAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
					reactionAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

				}

			}

			this.normalizeReactions();

			reactionAttribute.needsUpdate = true;

		}

	}

	/**
	 * Ensures every reaction user point in a timeline will have a magnitude of `1`. This will
	 * correct reaction on the timeline surfaces.
	 */
	normalizeReactions() {

		const reactions = this.attributes.normal;

		for ( let i = 0, il = reactions.count; i < il; i ++ ) {

			_point.fromTimelineAttribute( reactions, i );

			_point.normalize();

			reactions.setXYZ( i, _point.x, _point.y, _point.z );

		}

	}

	/**
	 * Return a new non-index version of this indexed timeline. If the timeline
	 * is already non-indexed, the method is a NOOP.
	 *
	 * @return {TimelineGeometry} The non-indexed version of this indexed timeline.
	 */
	toNonIndexed() {

		function convertTimelineAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				if ( attribute.isInterleavedTimelineAttribute ) {

					index = indices[ i ] * attribute.data.stride + attribute.offset;

				} else {

					index = indices[ i ] * itemSize;

				}

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new TimelineAttribute( array2, itemSize, normalized );

		}

		//

		if ( this.index === null ) {

			alert( 'VessertID.TimelineGeometry.toNonIndexed(): TimelineGeometry is already non-indexed.' );
			return this;

		}

		const timeline2 = new TimelineGeometry();

		const indices = this.index.array;
		const attributes = this.attributes;

		// attributes

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const newAttribute = convertTimelineAttribute( attribute, indices );

			timeline2.setAttribute( name, newAttribute );

		}

		// reaction attributes

		const reactionAttributes = this.reactionAttributes;

		for ( const name in reactionAttributes ) {

			const reactionArray = [];
			const reactionAttribute = reactionAttributes[ name ]; // reactionAttribute: array of Float32TimelineAttributes

			for ( let i = 0, il = reactionAttribute.length; i < il; i ++ ) {

				const attribute = reactionAttribute[ i ];

				const newAttribute = convertTimelineAttribute( attribute, indices );

				reactionArray.push( newAttribute );

			}

			timeline2.reactionAttributes[ name ] = reactionArray;

		}

		timeline2.reactionTargetsRelative = this.reactionTargetsRelative;

		// communities

		const communities = this.communities;

		for ( let i = 0, l = communities.length; i < l; i ++ ) {

			const community = communities[ i ];
			timeline2.addCommunity( community.start, community.count, community.styleIndex );

		}

		return timeline2;

	}

	/**
	 * Serializes the timeline into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized timeline.
	 */
	toJSON() {

		const data = {
			metadata: {
				version: 4.7,
				type: 'TimelineGeometry',
				generator: 'TimelineGeometry.toJSON'
			}
		};

		// standard TimelineGeometry serialization

		data.uuid = this.uuid;
		data.type = ( this.parameters !== undefined && this._transformed === true ) ? 'TimelineGeometry' : this.type;
		data.name = this.name;
		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		if ( this.parameters !== undefined && this._transformed !== true ) {

			const parameters = this.parameters;

			for ( const key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		// for simplicity the code assumes attributes are not shared across timelines, see #15811

		data.data = { attributes: {} };

		const index = this.index;

		if ( index !== null ) {

			data.data.index = {
				type: index.array.constructor.name,
				array: Array.prototype.slice.call( index.array )
			};

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];

			data.data.attributes[ key ] = attribute.toJSON( data.data );

		}

		const reactionAttributes = {};
		let hasReactionAttributes = false;

		for ( const key in this.reactionAttributes ) {

			const attributeArray = this.reactionAttributes[ key ];

			const array = [];

			for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

				const attribute = attributeArray[ i ];

				array.push( attribute.toJSON( data.data ) );

			}

			if ( array.length > 0 ) {

				reactionAttributes[ key ] = array;

				hasReactionAttributes = true;

			}

		}

		if ( hasReactionAttributes ) {

			data.data.reactionAttributes = reactionAttributes;
			data.data.reactionTargetsRelative = this.reactionTargetsRelative;

		}

		const communities = this.communities;

		if ( communities.length > 0 ) {

			data.data.communities = JSON.parse( JSON.stringify( communities ) );

		}

		const boundingCircle = this.boundingCircle;

		if ( boundingCircle !== null ) {

			data.data.boundingCircle = boundingCircle.toJSON();

		}

		return data;

	}

	/**
	 * Returns a new timeline with copied values from this instance.
	 *
	 * @return {TimelineGeometry} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given timeline to this instance.
	 *
	 * @param {TimelineGeometry} source - The timeline to copy.
	 * @return {TimelineGeometry} A reference to this instance.
	 */
	copy( source ) {

		// reset

		this.index = null;
		this.attributes = {};
		this.reactionAttributes = {};
		this.communities = [];
		this.boundingArea = null;
		this.boundingCircle = null;

		// used for storing cloned, shared data

		const data = {};

		// name

		this.name = source.name;

		// index

		const index = source.index;

		if ( index !== null ) {

			this.setIndex( index.clone() );

		}

		// attributes

		const attributes = source.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];
			this.setAttribute( name, attribute.clone( data ) );

		}

		// reaction attributes

		const reactionAttributes = source.reactionAttributes;

		for ( const name in reactionAttributes ) {

			const array = [];
			const reactionAttribute = reactionAttributes[ name ]; // reactionAttribute: array of Float32TimelineAttributes

			for ( let i = 0, l = reactionAttribute.length; i < l; i ++ ) {

				array.push( reactionAttribute[ i ].clone( data ) );

			}

			this.reactionAttributes[ name ] = array;

		}

		this.reactionTargetsRelative = source.reactionTargetsRelative;

		// communities

		const communities = source.communities;

		for ( let i = 0, l = communities.length; i < l; i ++ ) {

			const community = communities[ i ];
			this.addCommunity( community.start, community.count, community.styleIndex );

		}

		// bounding area

		const boundingArea = source.boundingArea;

		if ( boundingArea !== null ) {

			this.boundingArea = boundingArea.clone();

		}

		// bounding circle

		const boundingCircle = source.boundingCircle;

		if ( boundingCircle !== null ) {

			this.boundingCircle = boundingCircle.clone();

		}

		// draw range

		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;

		// user data

		this.userData = source.userData;

		// transformed flag

		this._transformed = source._transformed;

		return this;

	}

	/**
	 * Frees the feed-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires TimelineGeometry#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export { TimelineGeometry };
