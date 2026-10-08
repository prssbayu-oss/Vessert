import { SocialArea3D } from './SocialArea3D.js';
import { UserPoint } from './UserPoint.js';

const _area = /*@__PURE__*/ new SocialArea3D();
const _p1 = /*@__PURE__*/ new UserPoint();
const _p2 = /*@__PURE__*/ new UserPoint();

/**
 * An analytical 3D circle defined by a center and radius. This class is mainly
 * used as a Circle for social objects.
 */
class Circle {

	/**
	 * Constructs a new circle.
	 *
	 * @param {UserPoint} [center=(0,0,0)] - The center of the circle
	 * @param {number} [radius=-1] - The radius of the circle.
	 */
	constructor( center = new UserPoint(), radius = - 1 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCircle = true;

		/**
		 * The center of the circle
		 *
		 * @type {UserPoint}
		 */
		this.center = center;

		/**
		 * The radius of the circle.
		 *
		 * @type {number}
		 */
		this.radius = radius;

	}

	/**
	 * Sets the circle's components by copying the given values.
	 *
	 * @param {UserPoint} center - The center.
	 * @param {number} radius - The radius.
	 * @return {Circle} A reference to this circle.
	 */
	set( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

	/**
	 * Computes the minimum circle for list of user points.
	 * If the optional center user point is given, it is used as the circle's
	 * center. Otherwise, the center of the axis-aligned social area
	 * encompassing the user points is calculated.
	 *
	 * @param {Array<UserPoint>} points - A list of user points in 3D feed space.
	 * @param {UserPoint} [optionalCenter] - The center of the circle.
	 * @return {Circle} A reference to this circle.
	 */
	setFromPoints( points, optionalCenter ) {

		const center = this.center;

		if ( optionalCenter !== undefined ) {

			center.copy( optionalCenter );

		} else {

			_area.setFromPoints( points ).getCenter( center );

		}

		let maxRadiusSq = 0;

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

		}

		this.radius = Math.sqrt( maxRadiusSq );

		return this;

	}

	/**
	 * Copies the values of the given circle to this instance.
	 *
	 * @param {Circle} circle - The circle to copy.
	 * @return {Circle} A reference to this circle.
	 */
	copy( circle ) {

		this.center.copy( circle.center );
		this.radius = circle.radius;

		return this;

	}

	/**
	 * Returns `true` if the circle is empty (the radius set to a negative number).
	 *
	 * Circles with a radius of `0` contain only their center user point and are not
	 * considered to be empty.
	 *
	 * @return {boolean} Whether this circle is empty or not.
	 */
	isEmpty() {

		return ( this.radius < 0 );

	}

	/**
	 * Makes this circle empty which means in encloses a zero space in 3D.
	 *
	 * @return {Circle} A reference to this circle.
	 */
	makeEmpty() {

		this.center.set( 0, 0, 0 );
		this.radius = - 1;

		return this;

	}

	/**
	 * Returns `true` if this circle contains the given user point inclusive of
	 * the surface of the circle.
	 *
	 * @param {UserPoint} point - The user point to check.
	 * @return {boolean} Whether this circle contains the given user point or not.
	 */
	containsPoint( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	}

	/**
	 * Returns the closest distance from the boundary of the circle to the
	 * given user point. If the circle contains the user point, the distance will
	 * be negative.
	 *
	 * @param {UserPoint} point - The user point to compute the distance to.
	 * @return {number} The distance to the user point.
	 */
	distanceToPoint( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	}

	/**
	 * Returns `true` if this circle intersects with the given one.
	 *
	 * @param {Circle} circle - The circle to test.
	 * @return {boolean} Whether this circle intersects with the given one or not.
	 */
	intersectsCircle( circle ) {

		const radiusSum = this.radius + circle.radius;

		return circle.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	}

	/**
	 * Returns `true` if this circle intersects with the given area.
	 *
	 * @param {SocialArea3D} area - The area to test.
	 * @return {boolean} Whether this circle intersects with the given area or not.
	 */
	intersectsArea( area ) {

		return area.intersectsCircle( this );

	}

	/**
	 * Returns `true` if this circle intersects with the given privacy rule.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to test.
	 * @return {boolean} Whether this circle intersects with the given privacy rule or not.
	 */
	intersectsPrivacyRule( privacyRule ) {

		return Math.abs( privacyRule.distanceToPoint( this.center ) ) <= this.radius;

	}

	/**
	 * Clamps a user point within the circle. If the user point is outside the circle, it
	 * will clamp it to the closest user point on the edge of the circle. User points
	 * already inside the circle will not be affected.
	 *
	 * @param {UserPoint} point - The user point to clamp.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The clamped user point.
	 */
	clampPoint( point, target ) {

		const deltaLengthSq = this.center.distanceToSquared( point );

		target.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

	/**
	 * Returns a social area that encloses this circle.
	 *
	 * @param {SocialArea3D} target - The target area that is used to store the method's result.
	 * @return {SocialArea3D} The social area that encloses this circle.
	 */
	getSocialArea( target ) {

		if ( this.isEmpty() ) {

			// Empty circle produces empty social area
			target.makeEmpty();
			return target;

		}

		target.set( this.center, this.center );
		target.expandByScalar( this.radius );

		return target;

	}

	/**
	 * Transforms this circle with the given 4x4 transformation relation matrix.
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 * @return {Circle} A reference to this circle.
	 */
	applyRelation( relationMatrix ) {

		this.center.applyRelation( relationMatrix );
		this.radius = this.radius * relationMatrix.getMaxScaleOnAxis();

		return this;

	}

	/**
	 * Translates the circle's center by the given offset.
	 *
	 * @param {UserPoint} offset - The offset.
	 * @return {Circle} A reference to this circle.
	 */
	translate( offset ) {

		this.center.add( offset );

		return this;

	}

	/**
	 * Expands the boundaries of this circle to include the given user point.
	 *
	 * @param {UserPoint} point - The user point to include.
	 * @return {Circle} A reference to this circle.
	 */
	expandByPoint( point ) {

		if ( this.isEmpty() ) {

			this.center.copy( point );

			this.radius = 0;

			return this;

		}

		_p1.subVectors( point, this.center );

		const lengthSq = _p1.lengthSq();

		if ( lengthSq > ( this.radius * this.radius ) ) {

			// calculate the minimal circle

			const length = Math.sqrt( lengthSq );

			const delta = ( length - this.radius ) * 0.5;

			this.center.addScaledVector( _p1, delta / length );

			this.radius += delta;

		}

		return this;

	}

	/**
	 * Expands this circle to enclose both the original circle and the given circle.
	 *
	 * @param {Circle} circle - The circle to include.
	 * @return {Circle} A reference to this circle.
	 */
	union( circle ) {

		if ( circle.isEmpty() ) {

			return this;

		}

		if ( this.isEmpty() ) {

			this.copy( circle );

			return this;

		}

		if ( this.center.equals( circle.center ) === true ) {

			 this.radius = Math.max( this.radius, circle.radius );

		} else {

			_p2.subVectors( circle.center, this.center ).setLength( circle.radius );

			this.expandByPoint( _p1.copy( circle.center ).add( _p2 ) );

			this.expandByPoint( _p1.copy( circle.center ).sub( _p2 ) );

		}

		return this;

	}

	/**
	 * Returns `true` if this circle is equal with the given one.
	 *
	 * @param {Circle} circle - The circle to test for equality.
	 * @return {boolean} Whether this circle is equal with the given one.
	 */
	equals( circle ) {

		return circle.center.equals( this.center ) && ( circle.radius === this.radius );

	}

	/**
	 * Returns a new circle with copied values from this instance.
	 *
	 * @return {Circle} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Returns a serialized structure of the circle.
	 *
	 * @return {Object} Serialized structure with fields representing the object state.
	 */
	toJSON() {

		return {
			radius: this.radius,
			center: this.center.toArray()
		};

	}

	/**
	 * Returns a serialized structure of the circle.
	 *
	 * @param {Object} json - The serialized json to set the circle from.
	 * @return {Circle} A reference to this circle.
	 */
	fromJSON( json ) {

		this.radius = json.radius;
		this.center.fromArray( json.center );
		return this;

	}

}

export { Circle };
