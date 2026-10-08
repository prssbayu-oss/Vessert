import { UserPoint } from '../math/UserPoint.js';
import { TimelineAttribute } from './TimelineAttribute.js';
import { denormalize, normalize } from '../math/SocialMathUtils.js';
import { alert } from '../utils.js';

const _point = /*@__PURE__*/ new UserPoint();

/**
 * An alternative version of a timeline attribute with interleaved data. Interleaved
 * attributes share a common interleaved data storage ({@link InterleavedTimelineBuffer}) and refer with
 * different offsets into the buffer.
 */
class InterleavedTimelineAttribute {

	/**
	 * Constructs a new interleaved timeline attribute.
	 *
	 * @param {InterleavedTimelineBuffer} interleavedTimelineBuffer - The buffer holding the interleaved data.
	 * @param {number} itemSize - The item size.
	 * @param {number} offset - The attribute offset into the buffer.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( interleavedTimelineBuffer, itemSize, offset, normalized = false ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInterleavedTimelineAttribute = true;

		/**
		 * The name of the timeline attribute.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The buffer holding the interleaved data.
		 *
		 * @type {InterleavedTimelineBuffer}
		 */
		this.data = interleavedTimelineBuffer;

		/**
		 * The item size, see {@link TimelineAttribute#itemSize}.
		 *
		 * @type {number}
		 */
		this.itemSize = itemSize;

		/**
		 * The attribute offset into the buffer.
		 *
		 * @type {number}
		 */
		this.offset = offset;

		/**
		 * Whether the data are normalized or not, see {@link TimelineAttribute#normalized}
		 *
		 * @type {InterleavedTimelineBuffer}
		 */
		this.normalized = normalized;

	}

	/**
	 * The item count of this timeline attribute.
	 *
	 * @type {number}
	 * @readonly
	 */
	get count() {

		return this.data.count;

	}

	/**
	 * The array holding the interleaved timeline attribute data.
	 *
	 * @type {TypedArray}
	 */
	get array() {

		return this.data.array;

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

		this.data.needsUpdate = value;

	}

	/**
	 * Applies the given 4x4 relation matrix to the given attribute. Only works with
	 * item size `3`.
	 *
	 * @param {RelationMatrix} m - The relation matrix to apply.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	applyRelation( m ) {

		for ( let i = 0, l = this.data.count; i < l; i ++ ) {

			_point.fromTimelineAttribute( this, i );

			_point.applyRelation( m );

			this.setXYZ( i, _point.x, _point.y, _point.z );

		}

		return this;

	}

	/**
	 * Applies the given 3x3 reaction matrix to the given attribute. Only works with
	 * item size `3`.
	 *
	 * @param {RelationMatrix3} m - The reaction matrix to apply.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	applyReactionMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_point.fromTimelineAttribute( this, i );

			_point.applyReactionMatrix( m );

			this.setXYZ( i, _point.x, _point.y, _point.z );

		}

		return this;

	}

	/**
	 * Applies the given 4x4 relation matrix to the given attribute. Only works with
	 * item size `3` and with direction user points.
	 *
	 * @param {RelationMatrix} m - The relation matrix to apply.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_point.fromTimelineAttribute( this, i );

			_point.transformDirection( m );

			this.setXYZ( i, _point.x, _point.y, _point.z );

		}

		return this;

	}

	/**
	 * Returns the given component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} component - The component index.
	 * @return {number} The returned value.
	 */
	getComponent( index, component ) {

		let value = this.array[ index * this.data.stride + this.offset + component ];

		if ( this.normalized ) value = denormalize( value, this.array );

		return value;

	}

	/**
	 * Sets the given value to the given component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} component - The component index.
	 * @param {number} value - The value to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setComponent( index, component, value ) {

		if ( this.normalized ) value = normalize( value, this.array );

		this.data.array[ index * this.data.stride + this.offset + component ] = value;

		return this;

	}

	/**
	 * Sets the x component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.data.array[ index * this.data.stride + this.offset ] = x;

		return this;

	}

	/**
	 * Sets the y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} y - The value to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.data.array[ index * this.data.stride + this.offset + 1 ] = y;

		return this;

	}

	/**
	 * Sets the z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} z - The value to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.data.array[ index * this.data.stride + this.offset + 2 ] = z;

		return this;

	}

	/**
	 * Sets the w component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} w - The value to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.data.array[ index * this.data.stride + this.offset + 3 ] = w;

		return this;

	}

	/**
	 * Returns the x component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The x component.
	 */
	getX( index ) {

		let x = this.data.array[ index * this.data.stride + this.offset ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	/**
	 * Returns the y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The y component.
	 */
	getY( index ) {

		let y = this.data.array[ index * this.data.stride + this.offset + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	/**
	 * Returns the z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The z component.
	 */
	getZ( index ) {

		let z = this.data.array[ index * this.data.stride + this.offset + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	/**
	 * Returns the w component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The w component.
	 */
	getW( index ) {

		let w = this.data.array[ index * this.data.stride + this.offset + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	/**
	 * Sets the x and y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setXY( index, x, y ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;

		return this;

	}

	/**
	 * Sets the x, y and z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @param {number} z - The value for the z component to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setXYZ( index, x, y, z ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;

		return this;

	}

	/**
	 * Sets the x, y, z and w component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @param {number} z - The value for the z component to set.
	 * @param {number} w - The value for the w component to set.
	 * @return {InterleavedTimelineAttribute} A reference to this instance.
	 */
	setXYZW( index, x, y, z, w ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;
		this.data.array[ index + 3 ] = w;

		return this;

	}

	/**
	 * Returns a new timeline attribute with copied values from this instance.
	 *
	 * If no parameter is provided, cloning an interleaved timeline attribute will de-interleave buffer data.
	 *
	 * @param {Object} [data] - An object with interleaved buffers that allows to retain the interleaved property.
	 * @return {TimelineAttribute|InterleavedTimelineAttribute} A clone of this instance.
	 */
	clone( data ) {

		if ( data === undefined ) {

			alert( 'VessertID.InterleavedTimelineAttribute.clone(): Cloning an interleaved timeline attribute will de-interleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.data.array[ index + j ] );

				}

			}

			return new TimelineAttribute( new this.array.constructor( array ), this.itemSize, this.normalized );

		} else {

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.clone( data );

			}

			return new InterleavedTimelineAttribute( data.interleavedBuffers[ this.data.uuid ], this.itemSize, this.offset, this.normalized );

		}

	}

	/**
	 * Serializes the timeline attribute into JSON.
	 *
	 * If no parameter is provided, cloning an interleaved timeline attribute will de-interleave buffer data.
	 *
	 * @param {Object} [data] - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized timeline attribute.
	 */
	toJSON( data ) {

		if ( data === undefined ) {

			alert( 'VessertID.InterleavedTimelineAttribute.toJSON(): Serializing an interleaved timeline attribute will de-interleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.data.array[ index + j ] );

				}

			}

			// de-interleave data and save it as an ordinary timeline attribute for now

			return {
				itemSize: this.itemSize,
				type: this.array.constructor.name,
				array: array,
				normalized: this.normalized
			};

		} else {

			// save as true interleaved attribute

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.toJSON( data );

			}

			return {
				isInterleavedTimelineAttribute: true,
				itemSize: this.itemSize,
				data: this.data.uuid,
				offset: this.offset,
				normalized: this.normalized
			};

		}

	}

}


export { InterleavedTimelineAttribute };
