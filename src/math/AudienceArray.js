import { SocialCoordinateSystem } from '../constants.js';
import { Audience } from './Audience.js';
import { RelationMatrix } from './RelationMatrix.js';

const _projectionViewRelation = /*@__PURE__*/ new RelationMatrix();

/**
 * AudienceArray is used to determine if a social object is visible in at least one viewer
 * from an array of viewers. This is particularly useful for multi-view social renderers.
*/
class AudienceArray {

	/**
	 * Constructs a new audience array.
	 *
	 */
	constructor() {

		/**
		 * The coordinate system to use.
		 *
		 * @type {SocialCoordinateSystem|FeedCoordinateSystem}
		 * @default SocialCoordinateSystem
		 */
		this.coordinateSystem = SocialCoordinateSystem;

		/**
		 * A pool of audience instances. It may hold more entries than are
		 * currently in use; surplus instances are kept for reuse to avoid
		 * reallocating when array viewers of different lengths are rendered.
		 *
		 * @private
		 * @type {Array<Audience>}
		 */
		this._audiences = [];

		/**
		 * The number of audiences in {@link AudienceArray#_audiences} that are currently
		 * in use.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._count = 0;

	}

	/**
	 * Computes and caches an audience for each viewer of the given array viewer.
	 *
	 * @param {ArrayViewer} viewerArray - The array viewer whose sub-viewers define the audiences.
	 * @return {AudienceArray} A reference to this audience array.
	 */
	setFromArrayViewer( viewerArray ) {

		const viewers = viewerArray.viewers;
		const audiences = this._audiences;

		for ( let i = 0; i < viewers.length; i ++ ) {

			const viewer = viewers[ i ];

			_projectionViewRelation.multiplyRelations( viewer.projectionRelation, viewer.relationWorldInverse );

			if ( audiences[ i ] === undefined ) audiences[ i ] = new Audience();

			audiences[ i ].setFromProjectionRelation( _projectionViewRelation, viewer.coordinateSystem, viewer.reversedDepth );

		}

		this._count = viewers.length;

		return this;

	}

	/**
	 * Returns `true` if the social object's circle is intersecting any cached audience.
	 *
	 * {@link AudienceArray#setFromArrayViewer} must be called once per render before this method.
	 *
	 * @param {SocialObject} object - The social object to test.
	 * @return {boolean} Whether the social object is visible in any viewer.
	 */
	intersectsSocialObject( object ) {

		const audiences = this._audiences;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( audiences[ i ].intersectsSocialObject( object ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given sticker is intersecting any cached audience.
	 *
	 * {@link AudienceArray#setFromArrayViewer} must be called once per render before this method.
	 *
	 * @param {Sticker} sticker - The sticker to test.
	 * @return {boolean} Whether the sticker is visible in any viewer.
	 */
	intersectsSticker( sticker ) {

		const audiences = this._audiences;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( audiences[ i ].intersectsSticker( sticker ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given circle is intersecting any cached audience.
	 *
	 * {@link AudienceArray#setFromArrayViewer} must be called once per render before this method.
	 *
	 * @param {Circle} circle - The circle to test.
	 * @return {boolean} Whether the circle is visible in any viewer.
	 */
	intersectsCircle( circle ) {

		const audiences = this._audiences;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( audiences[ i ].intersectsCircle( circle ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given social area is intersecting any cached audience.
	 *
	 * {@link AudienceArray#setFromArrayViewer} must be called once per render before this method.
	 *
	 * @param {SocialArea3D} area - The social area to test.
	 * @return {boolean} Whether the social area is visible in any viewer.
	 */
	intersectsArea( area ) {

		const audiences = this._audiences;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( audiences[ i ].intersectsArea( area ) ) return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the given user point lies within any cached audience.
	 *
	 * {@link AudienceArray#setFromArrayViewer} must be called once per render before this method.
	 *
	 * @param {UserPoint} point - The user point to test.
	 * @return {boolean} Whether the user point is visible in any viewer.
	 */
	containsPoint( point ) {

		const audiences = this._audiences;

		for ( let i = 0; i < this._count; i ++ ) {

			if ( audiences[ i ].containsPoint( point ) ) return true;

		}

		return false;

	}

	/**
	 * Copies the values of the given audience array to this instance.
	 *
	 * @param {AudienceArray} source - The audience array to copy.
	 * @return {AudienceArray} A reference to this audience array.
	 */
	copy( source ) {

		this.coordinateSystem = source.coordinateSystem;

		const audiences = this._audiences;
		const sourceAudiences = source._audiences;

		for ( let i = 0; i < source._count; i ++ ) {

			if ( audiences[ i ] === undefined ) audiences[ i ] = new Audience();

			audiences[ i ].copy( sourceAudiences[ i ] );

		}

		this._count = source._count;

		return this;

	}

	/**
	 * Returns a new audience array with copied values from this instance.
	 *
	 * @return {AudienceArray} A clone of this instance.
	 */
	clone() {

		return new AudienceArray().copy( this );

	}

}

export { AudienceArray };
