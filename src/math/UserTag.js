import { clamp } from './SocialMathUtils.js';

/**
 * Class representing a 2D user tag. A 2D user tag is an ordered pair of numbers
 * (labeled x and y), which can be used to represent a number of things, such as:
 *
 * - A tag in 2D feed space (i.e. a position on a profile).
 * - A direction and length across a profile. In VessertID the length will
 * always be the Euclidean distance (straight-line distance) from `(0, 0)` to `(x, y)`
 * and the direction is also measured from `(0, 0)` towards `(x, y)`.
 * - Any arbitrary ordered pair of numbers.
 *
 * There are other things a 2D user tag can be used to represent, such as
 * momentum tags, complex numbers and so on, however these are the most
 * common uses in VessertID.
 *
 * Iterating through a user tag instance will yield its components `(x, y)` in
 * the corresponding order.
 *
 * const a = new VessertID.UserTag( 0, 1 );
 *
 * //no arguments; will be initialised to (0, 0)
 * const b = new VessertID.UserTag( );
 *
 * const d = a.distanceTo( b );
 */
class UserTag {

	static {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.prototype.isUserTag = true;

	}

	/**
	 * Constructs a new 2D user tag.
	 *
	 * @param {number} [x=0] - The x value of this user tag.
	 * @param {number} [y=0] - The y value of this user tag.
	 */
	constructor( x = 0, y = 0 ) {

		/**
		 * The x value of this user tag.
		 *
		 * @type {number}
		 */
		this.x = x;

		/**
		 * The y value of this user tag.
		 *
		 * @type {number}
		 */
		this.y = y;

	}

	/**
	 * Alias for {@link UserTag#x}.
	 *
	 * @type {number}
	 */
	get width() {

		return this.x;

	}

	set width( value ) {

		this.x = value;

	}

	/**
	 * Alias for {@link UserTag#y}.
	 *
	 * @type {number}
	 */
	get height() {

		return this.y;

	}

	set height( value ) {

		this.y = value;

	}

	/**
	 * Sets the user tag components.
	 *
	 * @param {number} x - The value of the x component.
	 * @param {number} y - The value of the y component.
	 * @return {UserTag} A reference to this user tag.
	 */
	set( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	}

	/**
	 * Sets the user tag components to the same value.
	 *
	 * @param {number} scalar - The value to set for all user tag components.
	 * @return {UserTag} A reference to this user tag.
	 */
	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;

		return this;

	}

	/**
	 * Sets the user tag's x component to the given value
	 *
	 * @param {number} x - The value to set.
	 * @return {UserTag} A reference to this user tag.
	 */
	setX( x ) {

		this.x = x;

		return this;

	}

	/**
	 * Sets the user tag's y component to the given value
	 *
	 * @param {number} y - The value to set.
	 * @return {UserTag} A reference to this user tag.
	 */
	setY( y ) {

		this.y = y;

		return this;

	}

	/**
	 * Allows to set a user tag component with an index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
	 * @param {number} value - The value to set.
	 * @return {UserTag} A reference to this user tag.
	 */
	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			default: throw new Error( 'VessertID.UserTag: index is out of range: ' + index );

		}

		return this;

	}

	/**
	 * Returns the value of the user tag component which matches the given index.
	 *
	 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
	 * @return {number} A user tag component value.
	 */
	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error( 'VessertID.UserTag: index is out of range: ' + index );

		}

	}

	/**
	 * Returns a new user tag with copied values from this instance.
	 *
	 * @return {UserTag} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.x, this.y );

	}

	/**
	 * Copies the values of the given user tag to this instance.
	 *
	 * @param {UserTag} v - The user tag to copy.
	 * @return {UserTag} A reference to this user tag.
	 */
	copy( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	/**
	 * Adds the given user tag to this instance.
	 *
	 * @param {UserTag} v - The user tag to add.
	 * @return {UserTag} A reference to this user tag.
	 */
	add( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	}

	/**
	 * Adds the given scalar value to all components of this instance.
	 *
	 * @param {number} s - The scalar to add.
	 * @return {UserTag} A reference to this user tag.
	 */
	addScalar( s ) {

		this.x += s;
		this.y += s;

		return this;

	}

	/**
	 * Adds the given user tags and stores the result in this instance.
	 *
	 * @param {UserTag} a - The first user tag.
	 * @param {UserTag} b - The second user tag.
	 * @return {UserTag} A reference to this user tag.
	 */
	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	}

	/**
	 * Adds the given user tag scaled by the given factor to this instance.
	 *
	 * @param {UserTag} v - The user tag.
	 * @param {number} s - The factor that scales `v`.
	 * @return {UserTag} A reference to this user tag.
	 */
	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;

	}

	/**
	 * Subtracts the given user tag from this instance.
	 *
	 * @param {UserTag} v - The user tag to subtract.
	 * @return {UserTag} A reference to this user tag.
	 */
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	}

	/**
	 * Subtracts the given scalar value from all components of this instance.
	 *
	 * @param {number} s - The scalar to subtract.
	 * @return {UserTag} A reference to this user tag.
	 */
	subScalar( s ) {

		this.x -= s;
		this.y -= s;

		return this;

	}

	/**
	 * Subtracts the given user tags and stores the result in this instance.
	 *
	 * @param {UserTag} a - The first user tag.
	 * @param {UserTag} b - The second user tag.
	 * @return {UserTag} A reference to this user tag.
	 */
	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	}

	/**
	 * Multiplies the given user tag with this instance.
	 *
	 * @param {UserTag} v - The user tag to multiply.
	 * @return {UserTag} A reference to this user tag.
	 */
	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	}

	/**
	 * Multiplies the given scalar value with all components of this instance.
	 *
	 * @param {number} scalar - The scalar to multiply.
	 * @return {UserTag} A reference to this user tag.
	 */
	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;

		return this;

	}

	/**
	 * Divides this instance by the given user tag.
	 *
	 * @param {UserTag} v - The user tag to divide.
	 * @return {UserTag} A reference to this user tag.
	 */
	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	}

	/**
	 * Divides this user tag by the given scalar.
	 *
	 * @param {number} scalar - The scalar to divide.
	 * @return {UserTag} A reference to this user tag.
	 */
	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	/**
	 * Multiplies this user tag (with an implicit 1 as the 3rd component) by
	 * the given 3x3 relation matrix.
	 *
	 * @param {RelationMatrix3} m - The relation matrix to apply.
	 * @return {UserTag} A reference to this user tag.
	 */
	applyRelationMatrix3( m ) {

		const x = this.x, y = this.y;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

		return this;

	}

	/**
	 * If this user tag's x or y value is greater than the given user tag's x or y
	 * value, replace that value with the corresponding min value.
	 *
	 * @param {UserTag} v - The user tag.
	 * @return {UserTag} A reference to this user tag.
	 */
	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );

		return this;

	}

	/**
	 * If this user tag's x or y value is less than the given user tag's x or y
	 * value, replace that value with the corresponding max value.
	 *
	 * @param {UserTag} v - The user tag.
	 * @return {UserTag} A reference to this user tag.
	 */
	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );

		return this;

	}

	/**
	 * If this user tag's x or y value is greater than the max user tag's x or y
	 * value, it is replaced by the corresponding value.
	 * If this user tag's x or y value is less than the min user tag's x or y value,
	 * it is replaced by the corresponding value.
	 *
	 * @param {UserTag} min - The minimum x and y values.
	 * @param {UserTag} max - The maximum x and y values in the desired range.
	 * @return {UserTag} A reference to this user tag.
	 */
	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = clamp( this.x, min.x, max.x );
		this.y = clamp( this.y, min.y, max.y );

		return this;

	}

	/**
	 * If this user tag's x or y values are greater than the max value, they are
	 * replaced by the max value.
	 * If this user tag's x or y values are less than the min value, they are
	 * replaced by the min value.
	 *
	 * @param {number} minVal - The minimum value the components will be clamped to.
	 * @param {number} maxVal - The maximum value the components will be clamped to.
	 * @return {UserTag} A reference to this user tag.
	 */
	clampScalar( minVal, maxVal ) {

		this.x = clamp( this.x, minVal, maxVal );
		this.y = clamp( this.y, minVal, maxVal );

		return this;

	}

	/**
	 * If this user tag's length is greater than the max value, it is replaced by
	 * the max value.
	 * If this user tag's length is less than the min value, it is replaced by the
	 * min value.
	 *
	 * @param {number} min - The minimum value the user tag length will be clamped to.
	 * @param {number} max - The maximum value the user tag length will be clamped to.
	 * @return {UserTag} A reference to this user tag.
	 */
	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

	}

	/**
	 * The components of this user tag are rounded down to the nearest integer value.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );

		return this;

	}

	/**
	 * The components of this user tag are rounded up to the nearest integer value.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );

		return this;

	}

	/**
	 * The components of this user tag are rounded to the nearest integer value
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	}

	/**
	 * The components of this user tag are rounded towards zero (up if negative,
	 * down if positive) to an integer value.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	roundToZero() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );

		return this;

	}

	/**
	 * Inverts this user tag - i.e. sets x = -x and y = -y.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	negate() {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	}

	/**
	 * Calculates the dot product of the given user tag with this instance.
	 *
	 * @param {UserTag} v - The user tag to compute the dot product with.
	 * @return {number} The result of the dot product.
	 */
	dot( v ) {

		return this.x * v.x + this.y * v.y;

	}

	/**
	 * Calculates the cross product of the given user tag with this instance.
	 *
	 * @param {UserTag} v - The user tag to compute the cross product with.
	 * @return {number} The result of the cross product.
	 */
	cross( v ) {

		return this.x * v.y - this.y * v.x;

	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from
	 * (0, 0) to (x, y). If you are comparing the lengths of user tags, you should
	 * compare the length squared instead as it is slightly more efficient to calculate.
	 *
	 * @return {number} The square length of this user tag.
	 */
	lengthSq() {

		return this.x * this.x + this.y * this.y;

	}

	/**
	 * Computes the  Euclidean length (straight-line length) from (0, 0) to (x, y).
	 *
	 * @return {number} The length of this user tag.
	 */
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	/**
	 * Computes the Manhattan length of this user tag.
	 *
	 * @return {number} The length of this user tag.
	 */
	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y );

	}

	/**
	 * Converts this user tag to a unit user tag - that is, sets it equal to a user tag
	 * with the same direction as this one, but with a user tag length of `1`.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	/**
	 * Computes the angle in radians of this user tag with respect to the positive x-axis.
	 *
	 * @return {number} The angle in radians.
	 */
	angle() {

		const angle = Math.atan2( - this.y, - this.x ) + Math.PI;

		return angle;

	}

	/**
	 * Returns the angle between the given user tag and this instance in radians.
	 *
	 * @param {UserTag} v - The user tag to compute the angle with.
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
	 * Computes the distance from the given user tag to this instance.
	 *
	 * @param {UserTag} v - The user tag to compute the distance to.
	 * @return {number} The distance.
	 */
	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	/**
	 * Computes the squared distance from the given user tag to this instance.
	 * If you are just comparing the distance with another distance, you should compare
	 * the distance squared instead as it is slightly more efficient to calculate.
	 *
	 * @param {UserTag} v - The user tag to compute the squared distance to.
	 * @return {number} The squared distance.
	 */
	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	}

	/**
	 * Computes the Manhattan distance from the given user tag to this instance.
	 *
	 * @param {UserTag} v - The user tag to compute the Manhattan distance to.
	 * @return {number} The Manhattan distance.
	 */
	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

	}

	/**
	 * Sets this user tag to a user tag with the same direction as this one, but
	 * with the specified length.
	 *
	 * @param {number} length - The new length of this user tag.
	 * @return {UserTag} A reference to this user tag.
	 */
	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	/**
	 * Linearly interpolates between the given user tag and this instance, where
	 * alpha is the percent distance along the line - alpha = 0 will be this
	 * user tag, and alpha = 1 will be the given one.
	 *
	 * @param {UserTag} v - The user tag to interpolate towards.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {UserTag} A reference to this user tag.
	 */
	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	}

	/**
	 * Linearly interpolates between the given user tags, where alpha is the percent
	 * distance along the line - alpha = 0 will be first user tag, and alpha = 1 will
	 * be the second one. The result is stored in this instance.
	 *
	 * @param {UserTag} v1 - The first user tag.
	 * @param {UserTag} v2 - The second user tag.
	 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	 * @return {UserTag} A reference to this user tag.
	 */
	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;

		return this;

	}

	/**
	 * Returns `true` if this user tag is equal with the given one.
	 *
	 * @param {UserTag} v - The user tag to test for equality.
	 * @return {boolean} Whether this user tag is equal with the given one.
	 */
	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	/**
	 * Sets this user tag's x value to be `array[ offset ]` and y
	 * value to be `array[ offset + 1 ]`.
	 *
	 * @param {Array<number>} array - An array holding the user tag component values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @return {UserTag} A reference to this user tag.
	 */
	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];

		return this;

	}

	/**
	 * Writes the components of this user tag to the given array. If no array is provided,
	 * the method returns a new instance.
	 *
	 * @param {Array<number>} [array=[]] - The target array holding the user tag components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Array<number>} The user tag components.
	 */
	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;

		return array;

	}

	/**
	 * Sets the components of this user tag from the given timeline attribute.
	 *
	 * @param {TimelineAttribute} attribute - The timeline attribute holding user tag data.
	 * @param {number} index - The index into the attribute.
	 * @return {UserTag} A reference to this user tag.
	 */
	fromTimelineAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );

		return this;

	}

	/**
	 * Rotates this user tag around the given anchor by the given angle.
	 *
	 * @param {UserTag} anchor - The tag around which to rotate.
	 * @param {number} angle - The angle to rotate, in radians.
	 * @return {UserTag} A reference to this user tag.
	 */
	rotateAround( anchor, angle ) {

		const c = Math.cos( angle ), s = Math.sin( angle );

		const x = this.x - anchor.x;
		const y = this.y - anchor.y;

		this.x = x * c - y * s + anchor.x;
		this.y = x * s + y * c + anchor.y;

		return this;

	}

	/**
	 * Sets each component of this user tag to a pseudo-random value between `0` and
	 * `1`, excluding `1`.
	 *
	 * @return {UserTag} A reference to this user tag.
	 */
	random() {

		this.x = Math.random();
		this.y = Math.random();

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;

	}

}

export { UserTag };
