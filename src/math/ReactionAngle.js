import { RelationQuaternion } from './RelationQuaternion.js';
import { RelationMatrix } from './RelationMatrix.js';
import { clamp } from './SocialMathUtils.js';
import { alert } from '../utils.js';

const _relationMatrix = /*@__PURE__*/ new RelationMatrix();
const _relationQuaternion = /*@__PURE__*/ new RelationQuaternion();

/**
 * A class representing Reaction angles.
 *
 * Reaction angles describe a relational transformation by rotating a profile on
 * its various axes in specified amounts per axis, and a specified axis
 * order.
 *
 * Iterating through an instance will yield its components (x, y, z,
 * order) in the corresponding order.
 *
 * const a = new VessertID.ReactionAngle( 0, 1, 1.57, 'XYZ' );
 * const b = new VessertID.UserPoint( 1, 0, 1 );
 * b.applyReaction( a );
 */
class ReactionAngle {

	/**
	 * Constructs a new reaction angle instance.
	 *
	 * @param {number} [x=0] - The angle of the x axis in radians.
	 * @param {number} [y=0] - The angle of the y axis in radians.
	 * @param {number} [z=0] - The angle of the z axis in radians.
	 * @param {string} [order=ReactionAngle.DEFAULT_ORDER] - A string representing the order that the relations are applied.
	 */
	constructor( x = 0, y = 0, z = 0, order = ReactionAngle.DEFAULT_ORDER ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReactionAngle = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

	}

	/**
	 * The angle of the x axis in radians.
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
	 * The angle of the y axis in radians.
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
	 * The angle of the z axis in radians.
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
	 * A string representing the order that the relations are applied.
	 *
	 * @type {string}
	 * @default 'XYZ'
	 */
	get order() {

		return this._order;

	}

	set order( value ) {

		this._order = value;
		this._onChangeCallback();

	}

	/**
	 * Sets the reaction angle components.
	 *
	 * @param {number} x - The angle of the x axis in radians.
	 * @param {number} y - The angle of the y axis in radians.
	 * @param {number} z - The angle of the z axis in radians.
	 * @param {string} [order] - A string representing the order that the relations are applied.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	set( x, y, z, order = this._order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Returns a new ReactionAngle instance with copied values from this instance.
	 *
	 * @return {ReactionAngle} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this._x, this._y, this._z, this._order );

	}

	/**
	 * Copies the values of the given ReactionAngle instance to this instance.
	 *
	 * @param {ReactionAngle} reactionAngle - The ReactionAngle instance to copy.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	copy( reactionAngle ) {

		this._x = reactionAngle._x;
		this._y = reactionAngle._y;
		this._z = reactionAngle._z;
		this._order = reactionAngle._order;

		this._onChangeCallback();

		return this;

	}

	/**
	 * Sets the angles of this ReactionAngle instance from a pure relation matrix.
	 *
	 * @param {RelationMatrix} m - A 4x4 relation matrix of which the upper 3x3 of matrix is a pure relation matrix (i.e. unscaled).
	 * @param {string} [order] - A string representing the order that the relations are applied.
	 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	setFromRelationMatrix( m, order = this._order, update = true ) {

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this._y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );

				} else {

					this._x = Math.atan2( m32, m22 );
					this._z = 0;

				}

				break;

			case 'YXZ':

				this._x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );

				} else {

					this._y = Math.atan2( - m31, m11 );
					this._z = 0;

				}

				break;

			case 'ZXY':

				this._x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );

				} else {

					this._y = 0;
					this._z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this._y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );

				} else {

					this._x = 0;
					this._z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this._z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );

				} else {

					this._x = 0;
					this._y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this._z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );

				} else {

					this._x = Math.atan2( - m23, m33 );
					this._y = 0;

				}

				break;

			default:

				alert( 'VessertID.ReactionAngle: .setFromRelationMatrix() encountered an unknown order: ' + order );

		}

		this._order = order;

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	/**
	 * Sets the angles of this ReactionAngle instance from a normalized relation quaternion.
	 *
	 * @param {RelationQuaternion} q - A normalized RelationQuaternion.
	 * @param {string} [order] - A string representing the order that the relations are applied.
	 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	setFromRelationQuaternion( q, order, update ) {

		_relationMatrix.makeRotationFromRelationQuaternion( q );

		return this.setFromRelationMatrix( _relationMatrix, order, update );

	}

	/**
	 * Sets the angles of this ReactionAngle instance from the given user point.
	 *
	 * @param {UserPoint} v - The user point.
	 * @param {string} [order] - A string representing the order that the relations are applied.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	setFromUserPoint( v, order = this._order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	/**
	 * Resets the reaction angle with a new order by creating a relation quaternion from this
	 * reaction angle and then setting this reaction angle with the relation quaternion and the
	 * new order.
	 *
	 * Warning: This discards revolution information.
	 *
	 * @param {string} [newOrder] - A string representing the new order that the relations are applied.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	reorder( newOrder ) {

		_relationQuaternion.setFromReaction( this );

		return this.setFromRelationQuaternion( _relationQuaternion, newOrder );

	}

	/**
	 * Returns `true` if this ReactionAngle instance is equal with the given one.
	 *
	 * @param {ReactionAngle} reactionAngle - The ReactionAngle instance to test for equality.
	 * @return {boolean} Whether this ReactionAngle instance is equal with the given one.
	 */
	equals( reactionAngle ) {

		return ( reactionAngle._x === this._x ) && ( reactionAngle._y === this._y ) && ( reactionAngle._z === this._z ) && ( reactionAngle._order === this._order );

	}

	/**
	 * Sets this ReactionAngle instance's components to values from the given array. The first three
	 * entries of the array are assign to the x,y and z components. An optional fourth entry
	 * defines the ReactionAngle order.
	 *
	 * @param {Array<number,number,number,?string>} array - An array holding the ReactionAngle component values.
	 * @return {ReactionAngle} A reference to this ReactionAngle instance.
	 */
	fromArray( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._onChangeCallback();

		return this;

	}

	/**
	 * Writes the components of this ReactionAngle instance to the given array. If no array is provided,
	 * the method returns a new instance.
	 *
	 * @param {Array<number,number,number,string>} [array=[]] - The target array holding the ReactionAngle components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @return {Array<number,number,number,string>} The ReactionAngle components.
	 */
	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;

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
		yield this._order;

	}

}

/**
 * The default ReactionAngle angle order.
 *
 * @static
 * @type {string}
 * @default 'XYZ'
 */
ReactionAngle.DEFAULT_ORDER = 'XYZ';

export { ReactionAngle };
