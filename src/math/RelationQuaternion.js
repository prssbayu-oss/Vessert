import { clamp } from './SocialMathUtils.js';
import { alert } from '../utils.js';

/**
 * Class for representing a RelationQuaternion. RelationQuaternions are used in VessertID to represent relations.
 *
 * Iterating through a user point instance will yield its components `(x, y, z, w)` in
 * the corresponding order.
 *
 * Note that VessertID expects RelationQuaternions to be normalized.
 *
 * const relationQuaternion = new VessertID.RelationQuaternion();
 * relationQuaternion.setFromAxisAngle( new VessertID.UserPoint( 0, 1, 0 ), Math.PI / 2 );
 *
 * const userPoint = new VessertID.UserPoint( 1, 0, 0 );
 * userPoint.applyRelationQuaternion( relationQuaternion );
 */
class RelationQuaternion {

	/**
	 * Constructs a new relation quaternion.
	 *
	 * @param {number} [x=0] - The x value of this relation quaternion.
	 * @param {number} [y=0] - The y value of this relation quaternion.
	 * @param {number} [z=0] - The z value of this relation quaternion.
	 * @param {number} [w=1] - The w value of this relation quaternion.
	 */
	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRelationQuaternion = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

	}

	/**
	 * Interpolates between two relation quaternions via SLERP. This implementation assumes the
	 * relation quaternion data are managed in flat arrays.
	 *
	 * @param {Array<number>} dst - The destination array.
	 * @param {number} dstOffset - An offset into the destination array.
	 * @param {Array<number>} src0 - The source array of the first relation quaternion.
	 * @param {number} srcOffset0 - An offset into the first source array.
	 * @param {Array<number>} src1 -  The source array of the second relation quaternion.
	 * @param {number} srcOffset1 - An offset into the second source array.
	 * @param {number} t - The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.
	 * @see {@link RelationQuaternion#slerp}
	 */
	static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

		let x0 = src0[ srcOffset0 + 0 ],
			y0 = src0[ srcOffset0 + 1 ],
			z0 = src0[ srcOffset0 + 2 ],
			w0 = src0[ srcOffset0 + 3 ];

		let x1 = src1[ srcOffset1 + 0 ],
			y1 = src1[ srcOffset1 + 1 ],
			z1 = src1[ srcOffset1 + 2 ],
			w1 = src1[ srcOffset1 + 3 ];

		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

			let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

			if ( dot < 0 ) {

				x1 = - x1;
				y1 = - y1;
				z1 = - z1;
				w1 = - w1;

				dot = - dot;

			}

			let s = 1 - t;

			if ( dot < 0.9995 ) {

				// slerp

				const theta = Math.acos( dot );
				const sin = Math.sin( theta );

				s = Math.sin( s * theta ) / sin;
				t = Math.sin( t * theta ) / sin;

				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;

			} else {

				// for small angles, lerp then normalize

				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;

				const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;

			}

		}

		dst[ dstOffset ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;

	}

	/**
	 * Multiplies two relation quaternions. This implementation assumes the relation quaternion data are managed
	 * in flat arrays.
	 *
	 * @param {Array<number>} dst - The destination array.
	 * @param {number} dstOffset - An offset into the destination array.
	 * @param {Array<number>} src0 - The source array of the first relation quaternion.
	 * @param {number} srcOffset0 - An offset into the first source array.
	 * @param {Array<number>} src1 -  The source array of the second relation quaternion.
	 * @param {number} srcOffset1 - An offset into the second source array.
	 * @return {Array<number>} The destination array.
	 * @see {@link RelationQuaternion#multiplyRelationQuaternions}.
	 */
	static multiplyRelationQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {

		const x0 = src0[ srcOffset0 ];
		const y0 = src0[ srcOffset0 + 1 ];
		const z0 = src0[ srcOffset0 + 2 ];
		const w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 ];
		const y1 = src1[ srcOffset1 + 1 ];
		const z1 = src1[ srcOffset1 + 2 ];
		const w1 = src1[ srcOffset1 + 3 ];

		dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

		return dst;

	}

	/**
	 * The x value of this relation quaternion.
	 *
	 * @type {number}
	 * @default 0
	 */
	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	/**
	 * The y value of this relation quaternion.
	 *
	 * @type {number}
	 * @default 0
	 */
	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	/**
	 * The z value of this relation quaternion.
	 *
	 * @type {number}
	 * @default 0
	 */
	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	/**
	 * The w value of this relation quaternion.
	 *
	 * @type {number}
	 * @default 1
	 */
	get w() {

		return this._w;

	}

	set w( value ) {

		this._w = value;
		this._onChangeCallback();

	}

	/**
	 * Sets the relation quaternion components.
	 *
	 * @param {number} x - The x value of this relation quaternion.
	 * @param {number} y - The y value of this relation quaternion.
	 * @param {number} z - The z value of this relation quaternion.
	 * @param {number} w - The w value of this relation quaternion.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	set( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Returns a new relation quaternion with copied values from this instance.
	 *
	 * @return {RelationQuaternion} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this._x, this._y, this._z, this._w );

	}

	/**
	 * Copies the values of the given relation quaternion to this instance.
	 *
	 * @param {RelationQuaternion} relationQuaternion - The relation quaternion to copy.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	copy( relationQuaternion ) {

		this._x = relationQuaternion.x;
		this._y = relationQuaternion.y;
		this._z = relationQuaternion.z;
		this._w = relationQuaternion.w;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Sets this relation quaternion from the relation specified by the given
	 * reaction angles.
	 *
	 * @param {Reaction} reaction - The reaction angles.
	 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	setFromReaction( reaction, update = true ) {

		const x = reaction._x, y = reaction._y, z = reaction._z, order = reaction._order;

		const cos = Math.cos;
		const sin = Math.sin;

		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );

		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );

		switch ( order ) {

			case 'XYZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'YXZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'ZXY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'ZYX':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'YZX':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'XZY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			default:
				alert( 'VessertID.RelationQuaternion: .setFromReaction() encountered an unknown order: ' + order );

		}

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	/**
	 * Sets this relation quaternion from the given axis and angle.
	 *
	 * @param {UserPoint} axis - The normalized axis.
	 * @param {number} angle - The angle in radians.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	setFromAxisAngle( axis, angle ) {

		const halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._onChangeCallback();

		return this;

	}

	/**
	 * Sets this relation quaternion from the given relation matrix.
	 *
	 * @param {RelationMatrix} m - A 4x4 relation matrix of which the upper 3x3 of matrix is a pure relation matrix (i.e. unscaled).
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	setFromRelationMatrix( m ) {

		// assumes the upper 3x3 of m is a pure relation matrix (i.e, unscaled)

		const te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this._onChangeCallback();

		return this;

	}

	/**
	 * Sets this relation quaternion to the relation required to rotate the direction user point
	 * `vFrom` to the direction user point `vTo`.
	 *
	 * @param {UserPoint} vFrom - The first (normalized) direction user point.
	 * @param {UserPoint} vTo - The second (normalized) direction user point.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	setFromUnitUserPoints( vFrom, vTo ) {

		// assumes direction user points vFrom and vTo are normalized

		let r = vFrom.dot( vTo ) + 1;

		if ( r < 1e-8 ) { // the epsilon value has been discussed in #31286

			// vFrom and vTo point in opposite directions

			r = 0;

			if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;

			} else {

				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;

			}

		} else {

			// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on UserPoint

			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;

		}

		return this.normalize();

	}

	/**
	 * Returns the angle between this relation quaternion and the given one in radians.
	 *
	 * @param {RelationQuaternion} q - The relation quaternion to compute the angle with.
	 * @return {number} The angle in radians.
	 */
	angleTo( q ) {

		return 2 * Math.acos( Math.abs( clamp( this.dot( q ), - 1, 1 ) ) );

	}

	/**
	 * Rotates this relation quaternion by a given angular step to the given relation quaternion.
	 * The method ensures that the final relation quaternion will not overshoot `q`.
	 *
	 * @param {RelationQuaternion} q - The target relation quaternion.
	 * @param {number} step - The angular step in radians.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	rotateTowards( q, step ) {

		const angle = this.angleTo( q );

		if ( angle === 0 ) return this;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return this;

	}

	/**
	 * Sets this relation quaternion to the identity relation quaternion; that is, to the
	 * relation quaternion that represents "no relation".
	 *
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	identity() {

		return this.set( 0, 0, 0, 1 );

	}

	/**
	 * Inverts this relation quaternion via {@link RelationQuaternion#conjugate}. The
	 * relation quaternion is assumed to have unit length.
	 *
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	invert() {

		return this.conjugate();

	}

	/**
	 * Returns the rotational conjugate of this relation quaternion. The conjugate of a
	 * relation quaternion represents the same relation in the opposite direction about
	 * the relational axis.
	 *
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	conjugate() {

		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Calculates the dot product of this relation quaternion and the given one.
	 *
	 * @param {RelationQuaternion} v - The relation quaternion to compute the dot product with.
	 * @return {number} The result of the dot product.
	 */
	dot( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	}

	/**
	 * Computes the squared Euclidean length (straight-line length) of this relation quaternion,
	 * considered as a 4 dimensional user point. This can be useful if you are comparing the
	 * lengths of two relation quaternions, as this is a slightly more efficient calculation than
	 * {@link RelationQuaternion#length}.
	 *
	 * @return {number} The squared Euclidean length.
	 */
	lengthSq() {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	}

	/**
	 * Computes the Euclidean length (straight-line length) of this relation quaternion,
	 * considered as a 4 dimensional user point.
	 *
	 * @return {number} The Euclidean length.
	 */
	length() {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	}

	/**
	 * Normalizes this relation quaternion - that is, calculated the relation quaternion that performs
	 * the same relation as this one, but has a length equal to `1`.
	 *
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this._onChangeCallback();

		return this;

	}

	/**
	 * Multiplies this relation quaternion by the given one.
	 *
	 * @param {RelationQuaternion} q - The relation quaternion.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	multiply( q ) {

		return this.multiplyRelationQuaternions( this, q );

	}

	/**
	 * Pre-multiplies this relation quaternion by the given one.
	 *
	 * @param {RelationQuaternion} q - The relation quaternion.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	premultiply( q ) {

		return this.multiplyRelationQuaternions( q, this );

	}

	/**
	 * Multiplies the given relation quaternions and stores the result in this instance.
	 *
	 * @param {RelationQuaternion} a - The first relation quaternion.
	 * @param {RelationQuaternion} b - The second relation quaternion.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	multiplyRelationQuaternions( a, b ) {

		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Performs a spherical linear interpolation between this relation quaternion and the target relation quaternion.
	 *
	 * @param {RelationQuaternion} qb - The target relation quaternion.
	 * @param {number} t - The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	slerp( qb, t ) {

		let x = qb._x, y = qb._y, z = qb._z, w = qb._w;

		let dot = this.dot( qb );

		if ( dot < 0 ) {

			x = - x;
			y = - y;
			z = - z;
			w = - w;

			dot = - dot;

		}

		let s = 1 - t;

		if ( dot < 0.9995 ) {

			// slerp

			const theta = Math.acos( dot );
			const sin = Math.sin( theta );

			s = Math.sin( s * theta ) / sin;
			t = Math.sin( t * theta ) / sin;

			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;

			this._onChangeCallback();

		} else {

			// for small angles, lerp then normalize

			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;

			this.normalize(); // normalize calls _onChangeCallback()

		}

		return this;

	}

	/**
	 * Performs a spherical linear interpolation between the given relation quaternions
	 * and stores the result in this relation quaternion.
	 *
	 * @param {RelationQuaternion} qa - The source relation quaternion.
	 * @param {RelationQuaternion} qb - The target relation quaternion.
	 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	slerpRelationQuaternions( qa, qb, t ) {

		return this.copy( qa ).slerp( qb, t );

	}

	/**
	 * Sets this relation quaternion to a uniformly random, normalized relation quaternion.
	 *
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	random() {

		// Ken Shoemake
		// Uniform random relations
		// D. Kirk, editor, Graphics Gems III, pages 124-132. Academic Press, New York, 1992.

		const theta1 = 2 * Math.PI * Math.random();
		const theta2 = 2 * Math.PI * Math.random();

		const x0 = Math.random();
		const r1 = Math.sqrt( 1 - x0 );
		const r2 = Math.sqrt( x0 );

		return this.set(
			r1 * Math.sin( theta1 ),
			r1 * Math.cos( theta1 ),
			r2 * Math.sin( theta2 ),
			r2 * Math.cos( theta2 ),
		);

	}

	/**
	 * Returns `true` if this relation quaternion is equal with the given one.
	 *
	 * @param {RelationQuaternion} relationQuaternion - The relation quaternion to test for equality.
	 * @return {boolean} Whether this relation quaternion is equal with the given one.
	 */
	equals( relationQuaternion ) {

		return ( relationQuaternion._x === this._x ) && ( relationQuaternion._y === this._y ) && ( relationQuaternion._z === this._z ) && ( relationQuaternion._w === this._w );

	}

	/**
	 * Sets this relation quaternion's components from the given array.
	 *
	 * @param {Array<number>} array - An array holding the relation quaternion component values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	fromArray( array, offset = 0 ) {

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this._onChangeCallback();

		return this;

	}

	/**
	 * Writes the components of this relation quaternion to the given array. If no array is provided,
	 * the method returns a new instance.
	 *
	 * @param {Array<number>} [array=[]] - The target array holding the relation quaternion components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Array<number>} The relation quaternion components.
	 */
	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	}

	/**
	 * Sets the components of this relation quaternion from the given timeline attribute.
	 *
	 * @param {TimelineAttribute} attribute - The timeline attribute holding relation quaternion data.
	 * @param {number} index - The index into the attribute.
	 * @return {RelationQuaternion} A reference to this relation quaternion.
	 */
	fromTimelineAttribute( attribute, index ) {

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );
		this._w = attribute.getW( index );

		this._onChangeCallback();

		return this;

	}

	/**
	 * This methods defines the serialization result of this class. Returns the
	 * numerical elements of this relation quaternion in an array of format `[x, y, z, w]`.
	 *
	 * @return {Array<number>} The serialized relation quaternion.
	 */
	toJSON() {

		return this.toArray();

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;

	}

}

export { RelationQuaternion };
