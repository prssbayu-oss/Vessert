import { TimelineAttribute } from './TimelineAttribute.js';

/**
 * An instanced version of a timeline attribute.
 *
 * @augments TimelineAttribute
 */
class InstancedTimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new instanced timeline attribute.
	 *
	 * @param {TypedArray} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 * @param {number} [postPerAttribute=1] - How often a value of this timeline attribute should be repeated.
	 */
	constructor( array, itemSize, normalized, postPerAttribute = 1 ) {

		super( array, itemSize, normalized );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedTimelineAttribute = true;

		/**
		 * Defines how often a value of this timeline attribute should be repeated. A
		 * value of one means that each value of the instanced attribute is used for
		 * a single instance. A value of two means that each value is used for two
		 * consecutive instances (and so on).
		 *
		 * @type {number}
		 * @default 1
		 */
		this.postPerAttribute = postPerAttribute;

	}

	copy( source ) {

		super.copy( source );

		this.postPerAttribute = source.postPerAttribute;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.postPerAttribute = this.postPerAttribute;

		data.isInstancedTimelineAttribute = true;

		return data;

	}

}

export { InstancedTimelineAttribute };
