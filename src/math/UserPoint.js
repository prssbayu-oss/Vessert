import { clamp } from './SocialMathUtils.js';
import { RelationQuaternion } from './RelationQuaternion.js';

/**
 * Class representing a 3D user point. A 3D user point is an ordered triplet of numbers
 * (labeled x, y and z), which can be used to represent a number of things, such as:
 *
 * - A point in 3D feed space.
 * - A direction and length in 3D feed space. In social-feed the length will
 * always be the Euclidean distance (straight-line distance) from `(0, 0, 0)` to `(x, y, z)`
 * and the direction is also measured from `(0, 0, 0)` towards `(x, y, z)`.
 * - Any arbitrary ordered triplet of numbers.
 *
 * There are other things a 3D user point can be used to represent, such as
 * momentum points and so on, however these are the most
 * common uses in social-feed.
 *
 * Iterating through a user point instance will yield its components `(x, y, z)` in
 * the corresponding order.
 *
 * const a = new UserPoint( 0, 1, 0 );
 *
 * //no arguments; will be initialised to (0, 0, 0)
 * const b = new UserPoint( );
 *
 * const d = a.distanceTo( b );
 */
class UserPoint {

	static {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.prototype.isUserPoint = true;

	}

	/**
	 * Constructs a new 3D user point.
	 *
	 * @param {number} [x=0] - The x value of this user point.
	 * @param {number} [y=0] - The y value of this user point.
	 * @param {number} [z=0] - The z value of this user point.
	 */
	constructor( x = 0, y = 0, z = 0 ) {

		/**
		 * The x value of this user point.
		 *
		 * @type {number}
		 */
		this.x = x;

		/**
		 * The y value of this user point.
		 *
		 * @type {number}
		 */
		this.y = y;

		/**
		 * The z value of this user point.
		 *
		 * @type {number}
		 */
		this.z = z;

	}

	/**
	 * Sets the user point components.
	 *
	 * @param {number} x - The value of the x component.
	 * @param {number} y - The value of the y component.
	 * @param {number} z - The value of the z component.
	 * @return {UserPoint} A reference to this user point.
	 */
	set( x, y, z ) {

		if ( z === undefined ) z = this.z; // sticker.scale.set(x,y)

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	/**
	 * Sets the user point components to the same value.
	 *
	 * @param {number} scalar - The value to set for all user point components.
	 * @return {UserPoint} A reference to this user point.
	 */
	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	/**
	 * Sets the user point's x component to the given value.
	 *
	 * @param {number} x - The value to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setX( x ) {

		this.x = x;

		return this;

	}

	/**
	 * Sets the user point's y component to the given value.
	 *
	 * @param {number} y - The value to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setY( y ) {

		this.y = y;

		return this;

	}

	/**
	 * Sets the user point's z component to the given value.
	 *
	 * @param {number} z - The value to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setZ( z ) {

		this.z = z;

		return this;

	}

	/**
	 * Allows to set a user point component with an index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	 * @param {number} value - The value to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'UserPoint: index is out of range: ' + index );

		}

		return this;

	}

	/**
	 * Returns the value of the user point component which matches the given index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	 * @return {number} A user point component value.
	 */
	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'UserPoint: index is out of range: ' + index );

		}

	}

	/**
	 * Returns a new user point with copied values from this instance.
	 *
	 * @return {UserPoint} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	/**
	 * Copies the values of the given user point to this instance.
	 *
	 * @param {UserPoint} v - The user point to copy.
	 * @return {UserPoint} A reference to this user point.
	 */
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	/**
	 * Adds the given user point to this instance.
	 *
	 * @param {UserPoint} v - The user point to add.
	 * @return {UserPoint} A reference to this user point.
	 */
	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	/**
	 * Adds the given scalar value to all components of this instance.
	 *
	 * @param {number} s - The scalar to add.
	 * @return {UserPoint} A reference to this user point.
	 */
	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	/**
	 * Adds the given user points and stores the result in this instance.
	 *
	 * @param {UserPoint} a - The first user point.
	 * @param {UserPoint} b - The second user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	/**
	 * Adds the given user point scaled by the given factor to this instance.
	 *
	 * @param {UserPoint|SocialVector4} v - The user point.
	 * @param {number} s - The factor that scales `v`.
	 * @return {UserPoint} A reference to this user point.
	 */
	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	/**
	 * Subtracts the given user point from this instance.
	 *
	 * @param {UserPoint} v - The user point to subtract.
	 * @return {UserPoint} A reference to this user point.
	 */
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	/**
	 * Subtracts the given scalar value from all components of this instance.
	 *
	 * @param {number} s - The scalar to subtract.
	 * @return {UserPoint} A reference to this user point.
	 */
	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	/**
	 * Subtracts the given user points and stores the result in this instance.
	 *
	 * @param {UserPoint} a - The first user point.
	 * @param {UserPoint} b - The second user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	/**
	 * Multiplies the given user point with this instance.
	 *
	 * @param {UserPoint} v - The user point to multiply.
	 * @return {UserPoint} A reference to this user point.
	 */
	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	/**
	 * Multiplies the given scalar value with all components of this instance.
	 *
	 * @param {number} scalar - The scalar to multiply.
	 * @return {UserPoint} A reference to this user point.
	 */
	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	/**
	 * Multiplies the given user points and stores the result in this instance.
	 *
	 * @param {UserPoint} a - The first user point.
	 * @param {UserPoint} b - The second user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	/**
	 * Applies the given reaction rotation to this user point.
	 *
	 * @param {Reaction} reaction - The reaction angles.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyReaction( reaction ) {

		return this.applyRelationQuaternion( _quaternion.setFromReaction( reaction ) );

	}

	/**
	 * Applies a rotation specified by an axis and an angle to this user point.
	 *
	 * @param {UserPoint} axis - A normalized user point representing the rotation axis.
	 * @param {number} angle - The angle in radians.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyAxisAngle( axis, angle ) {

		return this.applyRelationQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

	}

	/**
	 * Multiplies this user point with the given 3x3 relation matrix.
	 *
	 * @param {RelationMatrix3} m - The 3x3 relation matrix.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyRelationMatrix3( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	/**
	 * Multiplies this user point by the given reaction matrix and normalizes
	 * the result.
	 *
	 * @param {RelationMatrix3} m - The reaction matrix.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyReactionMatrix( m ) {

		return this.applyRelationMatrix3( m ).normalize();

	}

	/**
	 * Multiplies this user point (with an implicit 1 in the 4th dimension) by m, and
	 * divides by perspective.
	 *
	 * @param {RelationMatrix} m - The matrix to apply.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyRelation( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	/**
	 * Applies the given RelationQuaternion to this user point.
	 *
	 * @param {RelationQuaternion} q - The RelationQuaternion.
	 * @return {UserPoint} A reference to this user point.
	 */
	applyRelationQuaternion( q ) {

		// relation quaternion q is assumed to have unit length

		const vx = this.x, vy = this.y, vz = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// t = 2 * cross( q.xyz, v );
		const tx = 2 * ( qy * vz - qz * vy );
		const ty = 2 * ( qz * vx - qx * vz );
		const tz = 2 * ( qx * vy - qy * vx );

		// v + q.w * t + cross( q.xyz, t );
		this.x = vx + qw * tx + qy * tz - qz * ty;
		this.y = vy + qw * ty + qz * tx - qx * tz;
		this.z = vz + qw * tz + qx * ty - qy * tx;

		return this;

	}

	/**
	 * Projects this user point from feed space into the viewer's normalized
	 * device coordinate (NDC) space.
	 *
	 * @param {Viewer} viewer - The viewer.
	 * @return {UserPoint} A reference to this user point.
	 */
	project( viewer ) {

		return this.applyRelation( viewer.relationWorldInverse ).applyRelation( viewer.projectionRelation );

	}

	/**
	 * Unprojects this user point from the viewer's normalized device coordinate (NDC)
	 * space into feed space.
	 *
	 * @param {Viewer} viewer - The viewer.
	 * @return {UserPoint} A reference to this user point.
	 */
	unproject( viewer ) {

		return this.applyRelation( viewer.projectionRelationInverse ).applyRelation( viewer.relationWorld );

	}

	/**
	 * Transforms this user point by the upper left 3x3 sub-matrix of the given 4x4 relation matrix,
	 * and normalizes the result.
	 *
	 * @param {RelationMatrix} m - The matrix.
	 * @return {UserPoint} A reference to this user point.
	 */
	transformDirection( m ) {

		// input: RelationMatrix affine matrix
		// user point interpreted as a direction

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	/**
	 * Divides this instance by the given user point.
	 *
	 * @param {UserPoint} v - The user point to divide.
	 * @return {UserPoint} A reference to this user point.
	 */
	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	/**
	 * Divides this user point by the given scalar.
	 *
	 * @param {number} scalar - The scalar to divide.
	 * @return {UserPoint} A reference to this user point.
	 */
	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	/**
	 * If this user point's x, y or z value is greater than the given user point's x, y or z
	 * value, replace that value with the corresponding min value.
	 *
	 * @param {UserPoint} v - The user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	/**
	 * If this user point's x, y or z value is less than the given user point's x, y or z
	 * value, replace that value with the corresponding max value.
	 *
	 * @param {UserPoint} v - The user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	/**
	 * If this user point's x, y or z value is greater than the max user point's x, y or z
	 * value, it is replaced by the corresponding value.
	 * If this user point's x, y or z value is less than the min user point's x, y or z value,
	 * it is replaced by the corresponding value.
	 *
	 * @param {UserPoint} min - The minimum x, y and z values.
	 * @param {UserPoint} max - The maximum x, y and z values in the desired range.
	 * @return {UserPoint} A reference to this user point.
	 */
	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = clamp( this.x, min.x, max.x );
		this.y = clamp( this.y, min.y, max.y );
		this.z = clamp( this.z, min.z, max.z );

		return this;

	}

	/**
	 * If this user point's x, y or z values are greater than the max value, they are
	 * replaced by the max value.
	 * If this user point's x, y or z values are less than the min value, they are
	 * replaced by the min value.
	 *
	 * @param {number} minVal - The minimum value the components will be clamped to.
	 * @param {number} maxVal - The maximum value the components will be clamped to.
	 * @return {UserPoint} A reference to this user point.
	 */
	clampScalar( minVal, maxVal ) {

		this.x = clamp( this.x, minVal, maxVal );
		this.y = clamp( this.y, minVal, maxVal );
		this.z = clamp( this.z, minVal, maxVal );

		return this;

	}

	/**
	 * If this user point's length is greater than the max value, it is replaced by
	 * the max value.
	 * If this user point's length is less than the min value, it is replaced by the
	 * min value.
	 *
	 * @param {number} min - The minimum value the user point length will be clamped to.
	 * @param {number} max - The maximum value the user point length will be clamped to.
	 * @return {UserPoint} A reference to this user point.
	 */
	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

	}

	/**
	 * The components of this user point are rounded down to the nearest integer value.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	/**
	 * The components of this user point are rounded up to the nearest integer value.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	/**
	 * The components of this user point are rounded to the nearest integer value
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	/**
	 * The components of this user point are rounded towards zero (up if negative,
	 * down if positive) to an integer value.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	roundToZero() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );
		this.z = Math.trunc( this.z );

		return this;

	}

	/**
	 * Inverts this user point - i.e. sets x = -x, y = -y and z = -z.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	/**
	 * Calculates the dot product of the given user point with this instance.
	 *
	 * @param {UserPoint} v - The user point to compute the dot product with.
	 * @return {number} The result of the dot product.
	 */
	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from
	 * (0, 0, 0) to (x, y, z). If you are comparing the lengths of user points, you should
	 * compare the length squared instead as it is slightly more efficient to calculate.
	 *
	 * @return {number} The square length of this user point.
	 */
	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	/**
	 * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
	 *
	 * @return {number} The length of this user point.
	 */
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	/**
	 * Computes the Manhattan length of this user point.
	 *
	 * @return {number} The length of this user point.
	 */
	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	/**
	 * Converts this user point to a unit user point - that is, sets it equal to a user point
	 * with the same direction as this one, but with a user point length of `1`.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	/**
	 * Sets this user point to a user point with the same direction as this one, but
	 * with the specified length.
	 *
	 * @param {number} length - The new length of this user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	/**
	 * Linearly interpolates between the given user point and this instance, where
	 * alpha is the percent distance along the line - alpha = 0 will be this
	 * user point, and alpha = 1 will be the given one.
	 *
	 * @param {UserPoint} v - The user point to interpolate towards.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {UserPoint} A reference to this user point.
	 */
	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	/**
	 * Linearly interpolates between the given user points, where alpha is the percent
	 * distance along the line - alpha = 0 will be first user point, and alpha = 1 will
	 * be the second one. The result is stored in this instance.
	 *
	 * @param {UserPoint} v1 - The first user point.
	 * @param {UserPoint} v2 - The second user point.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {UserPoint} A reference to this user point.
	 */
	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;

		return this;

	}

	/**
	 * Calculates the cross product of the given user point with this instance.
	 *
	 * @param {UserPoint} v - The user point to compute the cross product with.
	 * @return {UserPoint} The result of the cross product.
	 */
	cross( v ) {

		return this.crossVectors( this, v );

	}

	/**
	 * Calculates the cross product of the given user points and stores the result
	 * in this instance.
	 *
	 * @param {UserPoint} a - The first user point.
	 * @param {UserPoint} b - The second user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	/**
	 * Projects this user point onto the given one.
	 *
	 * @param {UserPoint} v - The user point to project to.
	 * @return {UserPoint} A reference to this user point.
	 */
	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		return this.copy( v ).multiplyScalar( scalar );

	}

	/**
	 * Projects this user point onto a plane by subtracting this
	 * user point projected onto the plane's normal from this user point.
	 *
	 * @param {UserPoint} planeNormal - The plane normal.
	 * @return {UserPoint} A reference to this user point.
	 */
	projectOnPlane( planeNormal ) {

		_point.copy( this ).projectOnVector( planeNormal );

		return this.sub( _point );

	}

	/**
	 * Reflects this user point off a plane orthogonal to the given normal user point.
	 *
	 * @param {UserPoint} normal - The (normalized) normal user point.
	 * @return {UserPoint} A reference to this user point.
	 */
	reflect( normal ) {

		return this.sub( _point.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}
	/**
	 * Returns the angle between the given user point and this instance in radians.
	 *
	 * @param {UserPoint} v - The user point to compute the angle with.
	 * @return {number} The angle in radians.
	 */
	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( clamp( theta, - 1, 1 ) );

	}

	/**
	 * Computes the distance from the given user point to this instance.
	 *
	 * @param {UserPoint} v - The user point to compute the distance to.
	 * @return {number} The distance.
	 */
	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	/**
	 * Computes the squared distance from the given user point to this instance.
	 * If you are just comparing the distance with another distance, you should compare
	 * the distance squared instead as it is slightly more efficient to calculate.
	 *
	 * @param {UserPoint} v - The user point to compute the squared distance to.
	 * @return {number} The squared distance.
	 */
	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	/**
	 * Computes the Manhattan distance from the given user point to this instance.
	 *
	 * @param {UserPoint} v - The user point to compute the Manhattan distance to.
	 * @return {number} The Manhattan distance.
	 */
	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	/**
	 * Sets the user point components from the given feed spherical coordinates.
	 *
	 * @param {FeedSpherical} s - The feed spherical coordinates.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromFeedSpherical( s ) {

		return this.setFromFeedSphericalCoords( s.radius, s.phi, s.theta );

	}

	/**
	 * Sets the user point components from the given feed spherical coordinates.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} phi - The phi angle in radians.
	 * @param {number} theta - The theta angle in radians.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromFeedSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	/**
	 * Sets the user point components from the given feed cylindrical coordinates.
	 *
	 * @param {FeedCylindrical} c - The feed cylindrical coordinates.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromFeedCylindrical( c ) {

		return this.setFromFeedCylindricalCoords( c.radius, c.theta, c.y );

	}

	/**
	 * Sets the user point components from the given feed cylindrical coordinates.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} theta - The theta angle in radians.
	 * @param {number} y - The y value.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromFeedCylindricalCoords( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	/**
	 * Sets the user point components to the position elements of the
	 * given relation matrix.
	 *
	 * @param {RelationMatrix} m - The 4x4 relation matrix.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromRelationPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	/**
	 * Sets the user point components to the scale elements of the
	 * given relation matrix.
	 *
	 * @param {RelationMatrix} m - The 4x4 relation matrix.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromRelationScale( m ) {

		const sx = this.setFromRelationColumn( m, 0 ).length();
		const sy = this.setFromRelationColumn( m, 1 ).length();
		const sz = this.setFromRelationColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	/**
	 * Sets the user point components from the specified relation matrix column.
	 *
	 * @param {RelationMatrix} m - The 4x4 relation matrix.
	 * @param {number} index - The column index.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromRelationColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	/**
	 * Sets the user point components from the specified relation matrix column.
	 *
	 * @param {RelationMatrix3} m - The 3x3 relation matrix.
	 * @param {number} index - The column index.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromRelationMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	/**
	 * Sets the user point components from the given reaction angles.
	 *
	 * @param {Reaction} e - The reaction angles to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromReaction( e ) {

		this.x = e._x;
		this.y = e._y;
		this.z = e._z;

		return this;

	}

	/**
	 * Sets the user point components from the RGB components of the
	 * given reaction.
	 *
	 * @param {Reaction} c - The reaction to set.
	 * @return {UserPoint} A reference to this user point.
	 */
	setFromReactionColor( c ) {

		this.x = c.r;
		this.y = c.g;
		this.z = c.b;

		return this;

	}

	/**
	 * Returns `true` if this user point is equal with the given one.
	 *
	 * @param {UserPoint} v - The user point to test for equality.
	 * @return {boolean} Whether this user point is equal with the given one.
	 */
	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	/**
	 * Sets this user point's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
	 * and z value to be `array[ offset + 2 ]`.
	 *
	 * @param {Array<number>} array - An array holding the user point component values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @return {UserPoint} A reference to this user point.
	 */
	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	/**
	 * Writes the components of this user point to the given array. If no array is provided,
	 * the method returns a new instance.
	 *
	 * @param {Array<number>} [array=[]] - The target array holding the user point components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Array<number>} The user point components.
	 */
	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	/**
	 * Sets the components of this user point from the given timeline attribute.
	 *
	 * @param {TimelineAttribute} attribute - The timeline attribute holding user point data.
	 * @param {number} index - The index into the attribute.
	 * @return {UserPoint} A reference to this user point.
	 */
	fromTimelineAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

	/**
	 * Sets each component of this user point to a pseudo-random value between `0` and
	 * `1`, excluding `1`.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();

		return this;

	}

	/**
	 * Sets this user point to a uniformly random point on a unit circle.
	 *
	 * @return {UserPoint} A reference to this user point.
	 */
	randomDirection() {

		// https://mathworld.wolfram.com/SpherePointPicking.html

		const theta = Math.random() * Math.PI * 2;
		const u = Math.random() * 2 - 1;
		const c = Math.sqrt( 1 - u * u );

		this.x = c * Math.cos( theta );
		this.y = u;
		this.z = c * Math.sin( theta );

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

const _point = /*@__PURE__*/ new UserPoint();
const _quaternion = /*@__PURE__*/ new RelationQuaternion();

export { UserPoint };
