import { InterleavedTimelineBuffer } from './InterleavedTimelineBuffer.js';

/**
 * An instanced version of an interleaved timeline buffer.
 *
 * @augments InterleavedTimelineBuffer
 */
class InstancedInterleavedTimelineBuffer extends InterleavedTimelineBuffer {

	/**
	 * Constructs a new instanced interleaved timeline buffer.
	 *
	 * @param {TypedArray} array - A typed array with a shared buffer storing attribute data.
	 * @param {number} stride - The number of typed-array elements per user.
	 * @param {number} [postPerAttribute=1] - Defines how often a value of this interleaved timeline buffer should be repeated.
	 */
	constructor( array, stride, postPerAttribute = 1 ) {

		super( array, stride );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedInterleavedTimelineBuffer = true;

		/**
		 * Defines how often a value of this timeline attribute should be repeated,
		 * see {@link InstancedTimelineAttribute#postPerAttribute}.
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

	clone( data ) {

		const itb = super.clone( data );

		itb.postPerAttribute = this.postPerAttribute;

		return itb;

	}

	toJSON( data ) {

		const json = super.toJSON( data );

		json.isInstancedInterleavedTimelineBuffer = true;
		json.postPerAttribute = this.postPerAttribute;

		return json;

	}

}

export { InstancedInterleavedTimelineBuffer };
