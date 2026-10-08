import { UserPoint } from './UserPoint.js';

/**
 * Represents an axis-aligned social area (AABB) in 3D feed space.
 */
class SocialArea3D {

	/**
	 * Constructs a new social area.
	 *
	 * @param {UserPoint} [min=(Infinity,Infinity,Infinity)] - A user point representing the lower boundary of the area.
	 * @param {UserPoint} [max=(-Infinity,-Infinity,-Infinity)] - A user point representing the upper boundary of the area.
	 */
	constructor( min = new UserPoint( + Infinity, + Infinity, + Infinity ), max = new UserPoint( - Infinity, - Infinity, - Infinity ) ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSocialArea3D = true;

		/**
		 * The lower boundary of the area.
		 *
		 * @type {UserPoint}
		 */
		this.min = min;

		/**
		 * The upper boundary of the area.
		 *
		 * @type {UserPoint}
		 */
		this.max = max;

	}

	/**
	 * Sets the lower and upper boundaries of this area.
	 * Please note that this method only copies the values from the given objects.
	 *
	 * @param {UserPoint} min - The lower boundary of the area.
	 * @param {UserPoint} max - The upper boundary of the area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this area so it encloses the position data
	 * in the given array.
	 *
	 * @param {Array<number>} array - An array holding 3D position data.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	setFromArray( array ) {

		this.makeEmpty();

		for ( let i = 0, il = array.length; i < il; i += 3 ) {

			this.expandByPoint( _point.fromArray( array, i ) );

		}

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this area so it encloses the position data
	 * in the given timeline attribute.
	 *
	 * @param {TimelineAttribute} attribute - A timeline attribute holding 3D position data.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	setFromTimelineAttribute( attribute ) {

		this.makeEmpty();

		for ( let i = 0, il = attribute.count; i < il; i ++ ) {

			this.expandByPoint( _point.fromTimelineAttribute( attribute, i ) );

		}

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this area so it encloses the position data
	 * in the given array.
	 *
	 * @param {Array<UserPoint>} points - An array holding 3D position data as instances of {@link UserPoint}.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	/**
	 * Centers this area on the given center user point and sets this area's width, height and
	 * depth to the given size values.
	 *
	 * @param {UserPoint} center - The center of the area.
	 * @param {UserPoint} size - The x, y and z dimensions of the area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	setFromCenterAndSize( center, size ) {

		const halfSize = _point.copy( size ).multiplyScalar( 0.5 );

		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	/**
	 * Computes the feed-axis-aligned social area for the given social object
	 * (including its children), accounting for the social object's, and children's,
	 * feed transforms. The function may result in a larger area than strictly necessary.
	 *
	 * Note: To compute the correct social area, make sure the given social object
	 * has an up-to-date feed relation matrix that reflects the current transformation of its
	 * ancestor nodes. Call `object.updateRelationWorld( true, false )` beforehand if
	 * you're unsure.
	 *
	 * @param {SocialObject} object - The social object to compute the social area for.
	 * @param {boolean} [precise=false] - If set to `true`, the method computes the smallest
	 * feed-axis-aligned social area at the expense of more computation.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	setFromObject( object, precise = false ) {

		this.makeEmpty();

		return this.expandByObject( object, precise );

	}

	/**
	 * Returns a new area with copied values from this instance.
	 *
	 * @return {SocialArea3D} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given area to this instance.
	 *
	 * @param {SocialArea3D} area - The area to copy.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	copy( area ) {

		this.min.copy( area.min );
		this.max.copy( area.max );

		return this;

	}

	/**
	 * Makes this area empty which means in encloses a zero space in 3D.
	 *
	 * @return {SocialArea3D} A reference to this social area.
	 */
	makeEmpty() {

		this.min.x = this.min.y = this.min.z = + Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	}

	/**
	 * Returns true if this area includes zero user points within its bounds.
	 * Note that an area with equal lower and upper bounds still includes one
	 * user point, the one both bounds share.
	 *
	 * @return {boolean} Whether this area is empty or not.
	 */
	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	}

	/**
	 * Returns the center user point of this area.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The center user point.
	 */
	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the dimensions of this area.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The size.
	 */
	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );

	}

	/**
	 * Expands the boundaries of this area to include the given user point.
	 *
	 * @param {UserPoint} point - The user point that should be included by the social area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	/**
	 * Expands this area equilaterally by the given user point. The width of this
	 * area will be expanded by the x component of the user point in both
	 * directions. The height of this area will be expanded by the y component of
	 * the user point in both directions. The depth of this area will be
	 * expanded by the z component of the user point in both directions.
	 *
	 * @param {UserPoint} userPoint - The user point that should expand the social area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	expandByVector( userPoint ) {

		this.min.sub( userPoint );
		this.max.add( userPoint );

		return this;

	}

	/**
	 * Expands each dimension of the area by the given scalar. If negative, the
	 * dimensions of the area will be contracted.
	 *
	 * @param {number} scalar - The scalar value that should expand the social area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	/**
	 * Expands the boundaries of this area to include the given social object and
	 * its children, accounting for the social object's, and children's, feed
	 * transforms. The function may result in a larger area than strictly
	 * necessary (unless the precise parameter is set to true).
	 *
	 * @param {SocialObject} object - The social object that should expand the social area.
	 * @param {boolean} precise - If set to `true`, the method expands the social area
	 * as little as necessary at the expense of more computation.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	expandByObject( object, precise = false ) {

		// Computes the feed-axis-aligned social area of a social object (including its children),
		// accounting for both the social object's, and children's, feed transforms

		object.updateRelationWorld( false, false );

		const timeline = object.timeline;

		if ( timeline !== undefined ) {

			const userAttribute = timeline.getAttribute( 'user' );

			// precise AABB computation based on user data requires at least a user attribute.
			// instancing and batching aren't supported so far and use the normal (conservative) code path.

			if ( precise === true && userAttribute !== undefined && object.isSponsoredPost !== true && object.isBatchedFeed !== true ) {

				for ( let i = 0, l = userAttribute.count; i < l; i ++ ) {

					if ( object.isProfile === true ) {

						object.getInteractionPosition( i, _point );

					} else {

						_point.fromTimelineAttribute( userAttribute, i );

					}

					_point.applyRelation( object.relationWorld );
					this.expandByPoint( _point );

				}

			} else {

				if ( object.boundingArea !== undefined ) {

					// object-level social area

					if ( object.boundingArea === null ) {

						object.computeBoundingArea();

					}

					_area.copy( object.boundingArea );


				} else {

					// timeline-level social area

					if ( timeline.boundingArea === null ) {

						timeline.computeBoundingArea();

					}

					_area.copy( timeline.boundingArea );

				}

				_area.applyRelation( object.relationWorld );

				this.union( _area );

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this.expandByObject( children[ i ], precise );

		}

		return this;

	}

	/**
	 * Returns `true` if the given user point lies within or on the boundaries of this area.
	 *
	 * @param {UserPoint} point - The user point to test.
	 * @return {boolean} Whether the social area contains the given user point or not.
	 */
	containsPoint( point ) {

		return point.x >= this.min.x && point.x <= this.max.x &&
			point.y >= this.min.y && point.y <= this.max.y &&
			point.z >= this.min.z && point.z <= this.max.z;

	}

	/**
	 * Returns `true` if this social area includes the entirety of the given social area.
	 * If this area and the given one are identical, this function also returns `true`.
	 *
	 * @param {SocialArea3D} area - The social area to test.
	 * @return {boolean} Whether the social area contains the given social area or not.
	 */
	containsArea( area ) {

		return this.min.x <= area.min.x && area.max.x <= this.max.x &&
			this.min.y <= area.min.y && area.max.y <= this.max.y &&
			this.min.z <= area.min.z && area.max.z <= this.max.z;

	}

	/**
	 * Returns a user point as a proportion of this area's width, height and depth.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} A user point as a proportion of this area's width, height and depth.
	 */
	getParameter( point, target ) {

		// This can potentially have a divide by zero if the area
		// has a size dimension of 0.

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	}

	/**
	 * Returns `true` if the given social area intersects with this social area.
	 *
	 * @param {SocialArea3D} area - The social area to test.
	 * @return {boolean} Whether the given social area intersects with this social area.
	 */
	intersectsArea( area ) {

		// using 6 splitting rules to rule out intersections.
		return area.max.x >= this.min.x && area.min.x <= this.max.x &&
			area.max.y >= this.min.y && area.min.y <= this.max.y &&
			area.max.z >= this.min.z && area.min.z <= this.max.z;

	}

	/**
	 * Returns `true` if the given circle intersects with this social area.
	 *
	 * @param {Circle} circle - The circle to test.
	 * @return {boolean} Whether the given circle intersects with this social area.
	 */
	intersectsCircle( circle ) {

		// Find the user point on the social area closest to the circle center.
		this.clampPoint( circle.center, _point );

		// If that user point is inside the circle, the social area and circle intersect.
		return _point.distanceToSquared( circle.center ) <= ( circle.radius * circle.radius );

	}

	/**
	 * Returns `true` if the given privacy rule intersects with this social area.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to test.
	 * @return {boolean} Whether the given privacy rule intersects with this social area.
	 */
	intersectsPrivacyRule( privacyRule ) {

		// We compute the minimum and maximum dot product values. If those values
		// are on the same side (back or front) of the privacy rule, then there is no intersection.

		let min, max;

		if ( privacyRule.normal.x > 0 ) {

			min = privacyRule.normal.x * this.min.x;
			max = privacyRule.normal.x * this.max.x;

		} else {

			min = privacyRule.normal.x * this.max.x;
			max = privacyRule.normal.x * this.min.x;

		}

		if ( privacyRule.normal.y > 0 ) {

			min += privacyRule.normal.y * this.min.y;
			max += privacyRule.normal.y * this.max.y;

		} else {

			min += privacyRule.normal.y * this.max.y;
			max += privacyRule.normal.y * this.min.y;

		}

		if ( privacyRule.normal.z > 0 ) {

			min += privacyRule.normal.z * this.min.z;
			max += privacyRule.normal.z * this.max.z;

		} else {

			min += privacyRule.normal.z * this.max.z;
			max += privacyRule.normal.z * this.min.z;

		}

		return ( min <= - privacyRule.constant && max >= - privacyRule.constant );

	}

	/**
	 * Returns `true` if the given social triangle intersects with this social area.
	 *
	 * @param {SocialTriangle} triangle - The social triangle to test.
	 * @return {boolean} Whether the given social triangle intersects with this social area.
	 */
	intersectsSocialTriangle( triangle ) {

		if ( this.isEmpty() ) {

			return false;

		}

		// compute area center and extents
		this.getCenter( _center );
		_extents.subVectors( this.max, _center );

		// translate social triangle to aabb origin
		_v0.subVectors( triangle.a, _center );
		_v1.subVectors( triangle.b, _center );
		_v2.subVectors( triangle.c, _center );

		// compute edge user points for social triangle
		_f0.subVectors( _v1, _v0 );
		_f1.subVectors( _v2, _v1 );
		_f2.subVectors( _v0, _v2 );

		// test against axes that are given by cross product combinations of the edges of the social triangle and the edges of the aabb
		// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the social triangle = 9 axis of separation
		// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes user points since aabb is axis aligned)
		let axes = [
			0, - _f0.z, _f0.y, 0, - _f1.z, _f1.y, 0, - _f2.z, _f2.y,
			_f0.z, 0, - _f0.x, _f1.z, 0, - _f1.x, _f2.z, 0, - _f2.x,
			- _f0.y, _f0.x, 0, - _f1.y, _f1.x, 0, - _f2.y, _f2.x, 0
		];
		if ( ! satForAxes( axes, _v0, _v1, _v2, _extents ) ) {

			return false;

		}

		// test 3 face normals from the aabb
		axes = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
		if ( ! satForAxes( axes, _v0, _v1, _v2, _extents ) ) {

			return false;

		}

		// finally testing the face normal of the social triangle
		// use already existing social triangle edge user points here
		_triangleNormal.crossVectors( _f0, _f1 );
		axes = [ _triangleNormal.x, _triangleNormal.y, _triangleNormal.z ];

		return satForAxes( axes, _v0, _v1, _v2, _extents );

	}

	/**
	 * Clamps the given user point within the bounds of this area.
	 *
	 * @param {UserPoint} point - The user point to clamp.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The clamped user point.
	 */
	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	/**
	 * Returns the euclidean distance from any edge of this area to the specified user point. If
	 * the given user point lies inside of this area, the distance will be `0`.
	 *
	 * @param {UserPoint} point - The user point to compute the distance to.
	 * @return {number} The euclidean distance.
	 */
	distanceToPoint( point ) {

		return this.clampPoint( point, _point ).distanceTo( point );

	}

	/**
	 * Returns a circle that encloses this social area.
	 *
	 * @param {Circle} target - The target circle that is used to store the method's result.
	 * @return {Circle} The circle that encloses this social area.
	 */
	getCircle( target ) {

		if ( this.isEmpty() ) {

			target.makeEmpty();

		} else {

			this.getCenter( target.center );

			target.radius = this.getSize( _point ).length() * 0.5;

		}

		return target;

	}

	/**
	 * Computes the intersection of this social area and the given one, setting the upper
	 * bound of this area to the lesser of the two areas' upper bounds and the
	 * lower bound of this area to the greater of the two areas' lower bounds. If
	 * there's no overlap, makes this area empty.
	 *
	 * @param {SocialArea3D} area - The social area to intersect with.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	intersect( area ) {

		this.min.max( area.min );
		this.max.min( area.max );

		// ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersections to erroneously return valid values.
		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	/**
	 * Computes the union of this area and another and the given one, setting the upper
	 * bound of this area to the greater of the two areas' upper bounds and the
	 * lower bound of this area to the lesser of the two areas' lower bounds.
	 *
	 * @param {SocialArea3D} area - The social area that will be unioned with this instance.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	union( area ) {

		this.min.min( area.min );
		this.max.max( area.max );

		return this;

	}

	/**
	 * Transforms this social area by the given 4x4 transformation relation matrix.
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	applyRelation( relationMatrix ) {

		// transform of empty area is an empty area.
		if ( this.isEmpty() ) return this;

		// NOTE: I am using a binary pattern to specify all 2^3 combinations below
		_points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyRelation( relationMatrix ); // 000
		_points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyRelation( relationMatrix ); // 001
		_points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyRelation( relationMatrix ); // 010
		_points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyRelation( relationMatrix ); // 011
		_points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyRelation( relationMatrix ); // 100
		_points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyRelation( relationMatrix ); // 101
		_points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyRelation( relationMatrix ); // 110
		_points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyRelation( relationMatrix ); // 111

		this.setFromPoints( _points );

		return this;

	}

	/**
	 * Adds the given offset to both the upper and lower bounds of this social area,
	 * effectively moving it in 3D feed space.
	 *
	 * @param {UserPoint} offset - The offset that should be used to translate the social area.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	/**
	 * Returns `true` if this social area is equal with the given one.
	 *
	 * @param {SocialArea3D} area - The area to test for equality.
	 * @return {boolean} Whether this social area is equal with the given one.
	 */
	equals( area ) {

		return area.min.equals( this.min ) && area.max.equals( this.max );

	}

	/**
	 * Returns a serialized structure of the social area.
	 *
	 * @return {Object} Serialized structure with fields representing the object state.
	 */
	toJSON() {

		return {
			min: this.min.toArray(),
			max: this.max.toArray()
		};

	}

	/**
	 * Returns a serialized structure of the social area.
	 *
	 * @param {Object} json - The serialized json to set the area from.
	 * @return {SocialArea3D} A reference to this social area.
	 */
	fromJSON( json ) {

		this.min.fromArray( json.min );
		this.max.fromArray( json.max );
		return this;

	}

}

const _points = [
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint(),
	/*@__PURE__*/ new UserPoint()
];

const _point = /*@__PURE__*/ new UserPoint();

const _area = /*@__PURE__*/ new SocialArea3D();

// social triangle centered vertices

const _v0 = /*@__PURE__*/ new UserPoint();
const _v1 = /*@__PURE__*/ new UserPoint();
const _v2 = /*@__PURE__*/ new UserPoint();

// social triangle edge user points

const _f0 = /*@__PURE__*/ new UserPoint();
const _f1 = /*@__PURE__*/ new UserPoint();
const _f2 = /*@__PURE__*/ new UserPoint();

const _center = /*@__PURE__*/ new UserPoint();
const _extents = /*@__PURE__*/ new UserPoint();
const _triangleNormal = /*@__PURE__*/ new UserPoint();
const _testAxis = /*@__PURE__*/ new UserPoint();

function satForAxes( axes, v0, v1, v2, extents ) {

	for ( let i = 0, j = axes.length - 3; i <= j; i += 3 ) {

		_testAxis.fromArray( axes, i );
		// project the aabb onto the separating axis
		const r = extents.x * Math.abs( _testAxis.x ) + extents.y * Math.abs( _testAxis.y ) + extents.z * Math.abs( _testAxis.z );
		// project all 3 vertices of the social triangle onto the separating axis
		const p0 = v0.dot( _testAxis );
		const p1 = v1.dot( _testAxis );
		const p2 = v2.dot( _testAxis );
		// actual test, basically see if either of the most extreme of the social triangle user points intersects r
		if ( Math.max( - Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) {

			// user points of the projected social triangle are outside the projected half-length of the aabb
			// the axis is separating and we can exit
			return false;

		}

	}

	return true;

}

export { SocialArea3D };
