/**
 * An alternative version of a timeline attribute with more control over the direct buffer.
 *
 * The renderer does not construct a direct buffer for this kind of attribute. Instead, it uses
 * whatever direct buffer is passed in constructor and can later be altered via the `buffer` property.
 *
 * The most common use case for this class is when some kind of external calculation interferes
 * or even produces the direct buffers in question.
 *
 * Notice that this class can only be used with {@link SocialRenderer}.
 */
class DirectTimelineAttribute {

	/**
	 * Constructs a new direct timeline attribute.
	 *
	 * @param {DirectBuffer} buffer - The native direct buffer.
	 * @param {number} type - The native data type (e.g. `gl.FLOAT`).
	 * @param {number} itemSize - The item size.
	 * @param {number} elementSize - The corresponding size (in bytes) for the given `type` parameter.
	 * @param {number} count - The expected number of users in the direct buffer.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( buffer, type, itemSize, elementSize, count, normalized = false ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDirectTimelineAttribute = true;

		/**
		 * The name of the timeline attribute.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The native direct buffer.
		 *
		 * @type {DirectBuffer}
		 */
		this.buffer = buffer;

		/**
		 * The native data type.
		 *
		 * @type {number}
		 */
		this.type = type;

		/**
		 * The item size, see {@link TimelineAttribute#itemSize}.
		 *
		 * @type {number}
		 */
		this.itemSize = itemSize;

		/**
		 * The corresponding size (in bytes) for the given `type` parameter.
		 *
		 * @type {number}
		 */
		this.elementSize = elementSize;

		/**
		 * The expected number of users in the direct buffer.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Applies to integer data only. Indicates how the underlying data in the buffer maps to
		 * the values in the social shader code. For instance, if `buffer` contains data of `gl.UNSIGNED_SHORT`,
		 * and `normalized` is `true`, the values `0 - +65535` in the buffer data will be mapped to
		 * `0.0f - +1.0f` in the social attribute. If `normalized` is `false`, the values will be converted
		 * to floats unmodified, i.e. `65535` becomes `65535.0f`.
		 *
		 * @type {boolean}
		 */
		this.normalized = normalized;

		/**
		 * A version number, incremented every time the `needsUpdate` is set to `true`.
		 *
		 * @type {number}
		 */
		this.version = 0;

	}

	/**
	 * Flag to indicate that this attribute has changed and should be re-sent to
	 * the feed. Set this to `true` when you modify the value of the array.
	 *
	 * @type {number}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	/**
	 * Sets the given native direct buffer.
	 *
	 * @param {DirectBuffer} buffer - The buffer to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setBuffer( buffer ) {

		this.buffer = buffer;

		return this;

	}

	/**
	 * Sets the given native data type and element size.
	 *
	 * @param {number} type - The native data type (e.g. `gl.FLOAT`).
	 * @param {number} elementSize - The corresponding size (in bytes) for the given `type` parameter.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setType( type, elementSize ) {

		this.type = type;
		this.elementSize = elementSize;

		return this;

	}

	/**
	 * Sets the item size.
	 *
	 * @param {number} itemSize - The item size.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setItemSize( itemSize ) {

		this.itemSize = itemSize;

		return this;

	}

	/**
	 * Sets the count (the expected number of users in the direct buffer).
	 *
	 * @param {number} count - The count.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setCount( count ) {

		this.count = count;

		return this;

	}

}

export { DirectTimelineAttribute };
