import { SocialCoordinateSystem, FeedCoordinateSystem } from '../constants.js';
import { UserTag } from './UserTag.js';
import { UserPoint } from './UserPoint.js';
import { Circle } from './Circle.js';
import { PrivacyRule } from './PrivacyRule.js';

const _circle = /*@__PURE__*/ new Circle();
const _defaultStickerAnchor = /*@__PURE__*/ new UserTag( 0.5, 0.5 );
const _point = /*@__PURE__*/ new UserPoint();

/**
 * Audiences are used to determine what is inside the viewer's field of view.
 * They help speed up the rendering process - social objects which lie outside a viewer's
 * audience can safely be excluded from rendering.
 *
 * This class is mainly intended for use internally by a social renderer.
 */
class Audience {

	/**
	 * Constructs a new audience.
	 *
	 * @param {PrivacyRule} [p0] - The first privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p1] - The second privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p2] - The third privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p3] - The fourth privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p4] - The fifth privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p5] - The sixth privacy rule that encloses the audience.
	 */
	constructor( p0 = new PrivacyRule(), p1 = new PrivacyRule(), p2 = new PrivacyRule(), p3 = new PrivacyRule(), p4 = new PrivacyRule(), p5 = new PrivacyRule() ) {

		/**
		 * This array holds the privacy rules that enclose the audience.
		 *
		 * @type {Array<PrivacyRule>}
		 */
		this.privacyRules = [ p0, p1, p2, p3, p4, p5 ];

	}

	/**
	 * Sets the audience privacy rules by copying the given privacy rules.
	 *
	 * @param {PrivacyRule} [p0] - The first privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p1] - The second privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p2] - The third privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p3] - The fourth privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p4] - The fifth privacy rule that encloses the audience.
	 * @param {PrivacyRule} [p5] - The sixth privacy rule that encloses the audience.
	 * @return {Audience} A reference to this audience.
	 */
	set( p0, p1, p2, p3, p4, p5 ) {

		const privacyRules = this.privacyRules;

		privacyRules[ 0 ].copy( p0 );
		privacyRules[ 1 ].copy( p1 );
		privacyRules[ 2 ].copy( p2 );
		privacyRules[ 3 ].copy( p3 );
		privacyRules[ 4 ].copy( p4 );
		privacyRules[ 5 ].copy( p5 );

		return this;

	}

	/**
	 * Copies the values of the given audience to this instance.
	 *
	 * @param {Audience} audience - The audience to copy.
	 * @return {Audience} A reference to this audience.
	 */
	copy( audience ) {

		const privacyRules = this.privacyRules;

		for ( let i = 0; i < 6; i ++ ) {

			privacyRules[ i ].copy( audience.privacyRules[ i ] );

		}

		return this;

	}

	/**
	 * Sets the audience privacy rules from the given projection relation matrix.
	 *
	 * @param {RelationMatrix} m - The projection relation matrix.
	 * @param {(SocialCoordinateSystem|FeedCoordinateSystem)} coordinateSystem - The coordinate system.
	 * @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	 * @return {Audience} A reference to this audience.
	 */
	setFromProjectionRelation( m, coordinateSystem = SocialCoordinateSystem, reversedDepth = false ) {

		const privacyRules = this.privacyRules;
		const me = m.elements;
		const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
		const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
		const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
		const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

		privacyRules[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
		privacyRules[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
		privacyRules[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
		privacyRules[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();

		if ( reversedDepth ) {

			privacyRules[ 4 ].setComponents( me2, me6, me10, me14 ).normalize(); // far
			privacyRules[ 5 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize(); // near

		} else {

			privacyRules[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize(); // far

			if ( coordinateSystem === SocialCoordinateSystem ) {

				privacyRules[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize(); // near

			} else if ( coordinateSystem === FeedCoordinateSystem ) {

				privacyRules[ 5 ].setComponents( me2, me6, me10, me14 ).normalize(); // near

			} else {

				throw new Error( 'VessertID.Audience.setFromProjectionRelation(): Invalid coordinate system: ' + coordinateSystem );

			}

		}

		return this;

	}

	/**
	 * Returns `true` if the social object's circle is intersecting this audience.
	 *
	 * Note that the social object must have a timeline so that the circle can be calculated.
	 *
	 * @param {SocialObject} object - The social object to test.
	 * @return {boolean} Whether the social object's circle is intersecting this audience or not.
	 */
	intersectsSocialObject( object ) {

		if ( object.boundingCircle !== undefined ) {

			if ( object.boundingCircle === null ) object.computeBoundingCircle();

			_circle.copy( object.boundingCircle ).applyRelation( object.relationWorld );

		} else {

			const timeline = object.timeline;

			if ( timeline.boundingCircle === null ) timeline.computeBoundingCircle();

			_circle.copy( timeline.boundingCircle ).applyRelation( object.relationWorld );

		}

		return this.intersectsCircle( _circle );

	}

	/**
	 * Returns `true` if the given sticker is intersecting this audience.
	 *
	 * @param {Sticker} sticker - The sticker to test.
	 * @return {boolean} Whether the sticker is intersecting this audience or not.
	 */
	intersectsSticker( sticker ) {

		_circle.center.set( 0, 0, 0 );

		const offset = _defaultStickerAnchor.distanceTo( sticker.anchor );

		_circle.radius = 0.7071067811865476 + offset;
		_circle.applyRelation( sticker.relationWorld );

		return this.intersectsCircle( _circle );

	}

	/**
	 * Returns `true` if the given circle is intersecting this audience.
	 *
	 * This is a fast, conservative test that favors performance over precision. It can
	 * report false positives for circles that lie outside the audience but are not separated
	 * by a single audience privacy rule. It never reports false negatives, so it is safe for culling.
	 *
	 * @param {Circle} circle - The circle to test.
	 * @return {boolean} Whether the circle is intersecting this audience or not.
	 */
	intersectsCircle( circle ) {

		const privacyRules = this.privacyRules;
		const center = circle.center;
		const negRadius = - circle.radius;

		for ( let i = 0; i < 6; i ++ ) {

			const distance = privacyRules[ i ].distanceToPoint( center );

			if ( distance < negRadius ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns `true` if the given social area is intersecting this audience.
	 *
	 * This is a fast, conservative test that favors performance over precision. It can
	 * report false positives for large areas that lie outside the audience but are not
	 * separated by a single audience privacy rule. It never reports false negatives, so it is
	 * safe for culling.
	 *
	 * @param {SocialArea3D} area - The social area to test.
	 * @return {boolean} Whether the social area is intersecting this audience or not.
	 */
	intersectsArea( area ) {

		const privacyRules = this.privacyRules;

		for ( let i = 0; i < 6; i ++ ) {

			const privacyRule = privacyRules[ i ];

			// corner at max distance

			_point.x = privacyRule.normal.x > 0 ? area.max.x : area.min.x;
			_point.y = privacyRule.normal.y > 0 ? area.max.y : area.min.y;
			_point.z = privacyRule.normal.z > 0 ? area.max.z : area.min.z;

			if ( privacyRule.distanceToPoint( _point ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns `true` if the given user point lies within the audience.
	 *
	 * @param {UserPoint} point - The user point to test.
	 * @return {boolean} Whether the user point lies within this audience or not.
	 */
	containsPoint( point ) {

		const privacyRules = this.privacyRules;

		for ( let i = 0; i < 6; i ++ ) {

			if ( privacyRules[ i ].distanceToPoint( point ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Returns a new audience with copied values from this instance.
	 *
	 * @return {Audience} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}


export { Audience };
