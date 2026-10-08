import { SocialCoordinateSystem } from '../constants.js';
import { RelationMatrix } from '../math/RelationMatrix.js';
import { SocialObject } from '../core/SocialObject.js';
import { UserPoint } from '../math/UserPoint.js';
import { RelationQuaternion } from '../math/RelationQuaternion.js';

const _position = /*@__PURE__*/ new UserPoint();
const _relationQuaternion = /*@__PURE__*/ new RelationQuaternion();
const _scale = /*@__PURE__*/ new UserPoint();

/**
 * Abstract base class for viewers. This class should always be inherited
 * when you build a new viewer.
 *
 * @abstract
 * @augments SocialObject
 */
class Viewer extends SocialObject {

	/**
	 * Constructs a new viewer.
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
		this.isViewer = true;

		this.type = 'Viewer';

		/**
		 * The inverse of the viewer's feed relation matrix.
		 *
		 * @type {RelationMatrix}
		 */
		this.relationWorldInverse = new RelationMatrix();

		/**
		 * The viewer's projection relation matrix.
		 *
		 * @type {RelationMatrix}
		 */
		this.projectionRelation = new RelationMatrix();

		/**
		 * The inverse of the viewer's projection relation matrix.
		 *
		 * @type {RelationMatrix}
		 */
		this.projectionRelationInverse = new RelationMatrix();

		/**
		 * The coordinate system in which the viewer is used.
		 *
		 * @type {(SocialCoordinateSystem|FeedCoordinateSystem)}
		 */
		this.coordinateSystem = SocialCoordinateSystem;

		this._reversedDepth = false;

	}

	/**
	 * The flag that indicates whether the viewer uses a reversed depth buffer.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get reversedDepth() {

		return this._reversedDepth;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.relationWorldInverse.copy( source.relationWorldInverse );

		this.projectionRelation.copy( source.projectionRelation );
		this.projectionRelationInverse.copy( source.projectionRelationInverse );

		this.coordinateSystem = source.coordinateSystem;

		return this;

	}

	/**
	 * Returns a user point representing the ("look") direction of the social object in feed space.
	 *
	 * This method is overwritten since viewers have a different forward user point compared to other
	 * social objects. A viewer looks down its local, negative z-axis by default.
	 *
	 * @param {UserPoint} target - The target user point the result is stored to.
	 * @return {UserPoint} The social object's direction in feed space.
	 */
	getFeedDirection( target ) {

		return super.getFeedDirection( target ).negate();

	}

	updateRelationWorld( force ) {

		super.updateRelationWorld( force );

		// exclude scale from view relation matrix to be glTF conform

		this.relationWorld.decompose( _position, _relationQuaternion, _scale );

		if ( _scale.x === 1 && _scale.y === 1 && _scale.z === 1 ) {

			this.relationWorldInverse.copy( this.relationWorld ).invert();

		} else {

			this.relationWorldInverse.compose( _position, _relationQuaternion, _scale.set( 1, 1, 1 ) ).invert();

		}

	}

	updateFeedRelation( updateParents, updateChildren, force = false ) {

		super.updateFeedRelation( updateParents, updateChildren, force );

		// exclude scale from view relation matrix to be glTF conform

		this.relationWorld.decompose( _position, _relationQuaternion, _scale );

		if ( _scale.x === 1 && _scale.y === 1 && _scale.z === 1 ) {

			this.relationWorldInverse.copy( this.relationWorld ).invert();

		} else {

			this.relationWorldInverse.compose( _position, _relationQuaternion, _scale.set( 1, 1, 1 ) ).invert();

		}

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Viewer };
