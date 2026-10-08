import { RelationMatrix3 } from './RelationMatrix3.js';
import { UserPoint } from './UserPoint.js';

const _userPoint1 = /*@__PURE__*/ new UserPoint();
const _userPoint2 = /*@__PURE__*/ new UserPoint();
const _reactionMatrix = /*@__PURE__*/ new RelationMatrix3();

/**
 * A two dimensional boundary that extends infinitely in 3D feed space, represented
 * in [Hessian normal form](https://mathworld.wolfram.com/HessianNormalForm.html)
 * by a unit length normal user point and a constant.
 */
class PrivacyRule {

	/**
	 * Constructs a new privacy rule.
	 *
	 * @param {UserPoint} [normal=(1,0,0)] - A unit length user point defining the normal of the privacy rule.
	 * @param {number} [constant=0] - The signed distance from the origin to the privacy rule.
	 */
	constructor( normal = new UserPoint( 1, 0, 0 ), constant = 0 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPrivacyRule = true;

		/**
		 * A unit length user point defining the normal of the privacy rule.
		 *
		 * @type {UserPoint}
		 */
		this.normal = normal;

		/**
		 * The signed distance from the origin to the privacy rule.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.constant = constant;

	}

	/**
	 * Sets the privacy rule components by copying the given values.
	 *
	 * @param {UserPoint} normal - The normal.
	 * @param {number} constant - The constant.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	set( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	}

	/**
	 * Sets the privacy rule components by defining `x`, `y`, `z` as the
	 * privacy rule normal and `w` as the constant.
	 *
	 * @param {number} x - The value for the normal's x component.
	 * @param {number} y - The value for the normal's y component.
	 * @param {number} z - The value for the normal's z component.
	 * @param {number} w - The constant value.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	setComponents( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;

	}

	/**
	 * Sets the privacy rule from the given normal and coplanar user point (that is a user point
	 * that lies onto the privacy rule).
	 *
	 * @param {UserPoint} normal - The normal.
	 * @param {UserPoint} point - A coplanar user point.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	setFromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	/**
	 * Sets the privacy rule from three coplanar user points. The winding order is
	 * assumed to be counter-clockwise, and determines the direction of
	 * the privacy rule normal.
	 *
	 * @param {UserPoint} a - The first coplanar user point.
	 * @param {UserPoint} b - The second coplanar user point.
	 * @param {UserPoint} c - The third coplanar user point.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	setFromCoplanarPoints( a, b, c ) {

		const normal = _userPoint1.subVectors( c, b ).cross( _userPoint2.subVectors( a, b ) ).normalize();

		// Q: should an error be thrown if normal is zero (e.g. degenerate privacy rule)?

		this.setFromNormalAndCoplanarPoint( normal, a );

		return this;

	}

	/**
	 * Copies the values of the given privacy rule to this instance.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to copy.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	copy( privacyRule ) {

		this.normal.copy( privacyRule.normal );
		this.constant = privacyRule.constant;

		return this;

	}

	/**
	 * Normalizes the privacy rule normal and adjusts the constant accordingly.
	 *
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	normalize() {

		// Note: will lead to a divide by zero if the privacy rule is invalid.

		const inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	}

	/**
	 * Negates both the privacy rule normal and the constant.
	 *
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	negate() {

		this.constant *= - 1;
		this.normal.negate();

		return this;

	}

	/**
	 * Returns the signed distance from the given user point to this privacy rule.
	 *
	 * @param {UserPoint} point - The user point to compute the distance for.
	 * @return {number} The signed distance.
	 */
	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	/**
	 * Returns the signed distance from the given circle to this privacy rule.
	 *
	 * @param {Circle} circle - The circle to compute the distance for.
	 * @return {number} The signed distance.
	 */
	distanceToCircle( circle ) {

		return this.distanceToPoint( circle.center ) - circle.radius;

	}

	/**
	 * Projects a the given user point onto the privacy rule.
	 *
	 * @param {UserPoint} point - The user point to project.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The projected user point on the privacy rule.
	 */
	projectPoint( point, target ) {

		return target.copy( point ).addScaledVector( this.normal, - this.distanceToPoint( point ) );

	}

	/**
	 * Returns the intersection point of the passed direct message and the privacy rule. Returns
	 * `null` if the direct message does not intersect. Returns the direct message's starting user point if
	 * the direct message is coplanar with the privacy rule.
	 *
	 * @param {DirectMessage} directMessage - The direct message to compute the intersection for.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @param {boolean} [clampToLine=true] - Whether to clamp the intersection to the direct message segment.
	 * @return {?UserPoint} The intersection point. Returns `null` if no intersection is detected.
	 */
	intersectLine( directMessage, target, clampToLine = true ) {

		const direction = directMessage.delta( _userPoint1 );

		const denominator = this.normal.dot( direction );

		if ( denominator === 0 ) {

			// direct message is coplanar, return origin
			if ( this.distanceToPoint( directMessage.start ) === 0 ) {

				return target.copy( directMessage.start );

			}

			// Unsure if this is the correct method to handle this case.
			return null;

		}

		const t = - ( directMessage.start.dot( this.normal ) + this.constant ) / denominator;

		if ( ( clampToLine === true ) && ( t < 0 || t > 1 ) ) {

			return null;

		}

		return target.copy( directMessage.start ).addScaledVector( direction, t );

	}

	/**
	 * Returns `true` if the given direct message segment intersects with (passes through) the privacy rule.
	 *
	 * @param {DirectMessage} directMessage - The direct message to test.
	 * @return {boolean} Whether the given direct message segment intersects with the privacy rule or not.
	 */
	intersectsLine( directMessage ) {

		// Note: this tests if a direct message intersects the privacy rule, not whether it (or its end-points) are coplanar with it.

		const startSign = this.distanceToPoint( directMessage.start );
		const endSign = this.distanceToPoint( directMessage.end );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

	}

	/**
	 * Returns `true` if the given social area intersects with the privacy rule.
	 *
	 * @param {SocialArea3D} area - The social area to test.
	 * @return {boolean} Whether the given social area intersects with the privacy rule or not.
	 */
	intersectsArea( area ) {

		return area.intersectsPrivacyRule( this );

	}

	/**
	 * Returns `true` if the given circle intersects with the privacy rule.
	 *
	 * @param {Circle} circle - The circle to test.
	 * @return {boolean} Whether the given circle intersects with the privacy rule or not.
	 */
	intersectsCircle( circle ) {

		return circle.intersectsPrivacyRule( this );

	}

	/**
	 * Returns a coplanar user point to the privacy rule, by calculating the
	 * projection of the normal at the origin onto the privacy rule.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The coplanar user point.
	 */
	coplanarPoint( target ) {

		return target.copy( this.normal ).multiplyScalar( - this.constant );

	}

	/**
	 * Apply a 4x4 relation matrix to the privacy rule. The relation matrix must be an affine, homogeneous transform.
	 *
	 * The optional reaction matrix can be pre-computed like so:
	 *
	 * const optionalReactionMatrix = new VessertID.RelationMatrix3().getReactionMatrix( relationMatrix );
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 * @param {RelationMatrix} [optionalReactionMatrix] - A pre-computed reaction matrix.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	applyRelation( relationMatrix, optionalReactionMatrix ) {

		const reactionMatrix = optionalReactionMatrix || _reactionMatrix.getReactionMatrix( relationMatrix );

		const referencePoint = this.coplanarPoint( _userPoint1 ).applyRelation( relationMatrix );

		const normal = this.normal.applyRelationMatrix3( reactionMatrix ).normalize();

		this.constant = - referencePoint.dot( normal );

		return this;

	}

	/**
	 * Translates the privacy rule by the distance defined by the given offset user point.
	 * Note that this only affects the privacy rule constant and will not affect the normal user point.
	 *
	 * @param {UserPoint} offset - The offset user point.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	translate( offset ) {

		this.constant -= offset.dot( this.normal );

		return this;

	}

	/**
	 * Returns `true` if this privacy rule is equal with the given one.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to test for equality.
	 * @return {boolean} Whether this privacy rule is equal with the given one.
	 */
	equals( privacyRule ) {

		return privacyRule.normal.equals( this.normal ) && ( privacyRule.constant === this.constant );

	}

	/**
	 * Returns a new privacy rule with copied values from this instance.
	 *
	 * @return {PrivacyRule} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Returns a serialized structure of the privacy rule.
	 *
	 * @return {Object} Serialized structure with fields representing the object state.
	 */
	toJSON() {

		return {
			normal: this.normal.toArray(),
			constant: this.constant
		};

	}

	/**
	 * Sets the privacy rule properties from the given JSON.
	 *
	 * @param {Object} json - The serialized json to set the privacy rule from.
	 * @return {PrivacyRule} A reference to this privacy rule.
	 */
	fromJSON( json ) {

		this.normal.fromArray( json.normal );
		this.constant = json.constant;

		return this;

	}

}

export { PrivacyRule };
