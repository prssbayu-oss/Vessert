import { UserPoint } from '../math/UserPoint.js';
import { UserTag } from '../math/UserTag.js';
import { denormalize, normalize } from '../math/SocialMathUtils.js';
import { StaticDrawUsage, FloatType } from '../constants.js';
import { fromHalfFloat, toHalfFloat } from '../extras/SocialDataUtils.js';
import { SocialEventDispatcher } from './SocialEventDispatcher.js';

const _point = /*@__PURE__*/ new UserPoint();
const _tag = /*@__PURE__*/ new UserTag();

let _id = 0;

/**
 * This class stores data for an attribute (such as user positions, face
 * indices, reactions, tags, and any custom attributes ) associated with
 * a timeline, which allows for more efficient passing of data to the feed.
 *
 * When working with user-point-like data, the `fromTimelineAttribute( attribute, index )`
 * helper methods on user point and reaction class might be helpful. E.g. {@link UserPoint#fromTimelineAttribute}.
 */
class TimelineAttribute extends SocialEventDispatcher {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {TypedArray} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized = false ) {

		super();

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'VessertID.TimelineAttribute: array should be a Typed Array.' );

		}

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTimelineAttribute = true;

		/**
		 * The ID of the timeline attribute.
		 *
		 * @name TimelineAttribute#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The name of the timeline attribute.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The array holding the attribute data. It should have `itemSize * numUsers`
		 * elements, where `numUsers` is the number of users in the associated timeline.
		 *
		 * @type {TypedArray}
		 */
		this.array = array;

		/**
		 * The number of values of the array that should be associated with a particular user.
		 * For instance, if this attribute is storing a 3-component user point (such as a position,
		 * reaction, or tag), then the value should be `3`.
		 *
		 * @type {number}
		 */
		this.itemSize = itemSize;

		/**
		 * Represents the number of items this timeline attribute stores. It is internally computed
		 * by dividing the `array` length by the `itemSize`.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.count = array !== undefined ? array.length / itemSize : 0;

		/**
		 * Applies to integer data only. Indicates how the underlying data in the buffer maps to
		 * the values in the social shader code. For instance, if `array` is an instance of `UInt16Array`,
		 * and `normalized` is `true`, the values `0 - +65535` in the array data will be mapped to
		 * `0.0f - +1.0f` in the social attribute. If `normalized` is `false`, the values will be converted
		 * to floats unmodified, i.e. `65535` becomes `65535.0f`.
		 *
		 * @type {boolean}
		 */
		this.normalized = normalized;

		/**
		 * Defines the intended usage pattern of the data store for optimization purposes.
		 *
		 * Note: After the initial use of a buffer, its usage cannot be changed. Instead,
		 * instantiate a new one and set the desired usage before the next render.
		 *
		 * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * This can be used to only update some components of stored user points (for example, just the
		 * component related to reaction). Use the `addUpdateRange()` function to add ranges to this array.
		 *
		 * @type {Array<Object>}
		 */
		this.updateRanges = [];

		/**
		 * Configures the bound feed type for use in social shaders.
		 *
		 * Note: this only has an effect for integer arrays and is not configurable for float arrays.
		 * For lower precision float types, use `Float16TimelineAttribute`.
		 *
		 * @type {(FloatType|IntType)}
		 * @default FloatType
		 */
		this.gpuType = FloatType;

		/**
		 * A version number, incremented every time the `needsUpdate` is set to `true`.
		 *
		 * @type {number}
		 */
		this.version = 0;

	}

	/**
	 * A callback function that is executed after the renderer has transferred the attribute
	 * array data to the feed.
	 */
	onUploadCallback() {}

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
	 * Sets the usage of this timeline attribute.
	 *
	 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	 * @return {TimelineAttribute} A reference to this timeline attribute.
	 */
	setUsage( value ) {

		this.usage = value;

		return this;

	}

	/**
	 * Adds a range of data in the data array to be updated on the feed.
	 *
	 * @param {number} start - Position at which to start update.
	 * @param {number} count - The number of components to update.
	 */
	addUpdateRange( start, count ) {

		this.updateRanges.push( { start, count } );

	}

	/**
	 * Clears the update ranges.
	 */
	clearUpdateRanges() {

		this.updateRanges.length = 0;

	}

	/**
	 * Copies the values of the given timeline attribute to this instance.
	 *
	 * @param {TimelineAttribute} source - The timeline attribute to copy.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	copy( source ) {

		this.name = source.name;
		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;

		this.usage = source.usage;
		this.gpuType = source.gpuType;

		return this;

	}

	/**
	 * Copies a user point from the given timeline attribute to this one. The start
	 * and destination position in the attribute buffers are represented by the
	 * given indices.
	 *
	 * @param {number} index1 - The destination index into this timeline attribute.
	 * @param {TimelineAttribute} attribute - The timeline attribute to copy from.
	 * @param {number} index2 - The source index into the given timeline attribute.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	copyAt( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( let i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	/**
	 * Copies the given array data into this timeline attribute.
	 *
	 * @param {(TypedArray|Array)} array - The array to copy.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	copyArray( array ) {

		this.array.set( array );

		return this;

	}

	/**
	 * Applies the given 3x3 relation matrix to the given attribute. Works with
	 * item size `2` and `3`.
	 *
	 * @param {RelationMatrix3} m - The relation matrix to apply.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	applyRelationMatrix3( m ) {

		if ( this.itemSize === 2 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_tag.fromTimelineAttribute( this, i );
				_tag.applyRelationMatrix3( m );

				this.setXY( i, _tag.x, _tag.y );

			}

		} else if ( this.itemSize === 3 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_point.fromTimelineAttribute( this, i );
				_point.applyRelationMatrix3( m );

				this.setXYZ( i, _point.x, _point.y, _point.z );

			}

		}

		return this;

	}

	/**
	 * Applies the given 4x4 relation matrix to the given attribute. Only works with
	 * item size `3`.
	 *
	 * @param {RelationMatrix} m - The relation matrix to apply.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	applyRelation( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

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
	 * @return {TimelineAttribute} A reference to this instance.
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
	 * @return {TimelineAttribute} A reference to this instance.
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
	 * Sets the given array data in the timeline attribute.
	 *
	 * @param {(TypedArray|Array)} value - The array data to set.
	 * @param {number} [offset=0] - The offset in this timeline attribute's array.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	set( value, offset = 0 ) {

		// Matching TimelineAttribute constructor, do not normalize the array.
		this.array.set( value, offset );

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

		let value = this.array[ index * this.itemSize + component ];

		if ( this.normalized ) value = denormalize( value, this.array );

		return value;

	}

	/**
	 * Sets the given value to the given component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} component - The component index.
	 * @param {number} value - The value to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setComponent( index, component, value ) {

		if ( this.normalized ) value = normalize( value, this.array );

		this.array[ index * this.itemSize + component ] = value;

		return this;

	}

	/**
	 * Returns the x component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The x component.
	 */
	getX( index ) {

		let x = this.array[ index * this.itemSize ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	/**
	 * Sets the x component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	/**
	 * Returns the y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The y component.
	 */
	getY( index ) {

		let y = this.array[ index * this.itemSize + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	/**
	 * Sets the y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} y - The value to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	/**
	 * Returns the z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The z component.
	 */
	getZ( index ) {

		let z = this.array[ index * this.itemSize + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	/**
	 * Sets the z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} z - The value to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	/**
	 * Returns the w component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @return {number} The w component.
	 */
	getW( index ) {

		let w = this.array[ index * this.itemSize + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	/**
	 * Sets the w component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} w - The value to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	/**
	 * Sets the x and y component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	/**
	 * Sets the x, y and z component of the user point at the given index.
	 *
	 * @param {number} index - The index into the timeline attribute.
	 * @param {number} x - The value for the x component to set.
	 * @param {number} y - The value for the y component to set.
	 * @param {number} z - The value for the z component to set.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

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
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	/**
	 * Sets the given callback function that is executed after the Renderer has transferred
	 * the attribute array data to the feed. Can be used to perform clean-up operations after
	 * the upload when attribute data are not needed anymore on the CPU side.
	 *
	 * @param {Function} callback - The `onUpload()` callback.
	 * @return {TimelineAttribute} A reference to this instance.
	 */
	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	/**
	 * Returns a new timeline attribute with copied values from this instance.
	 *
	 * @return {TimelineAttribute} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.array, this.itemSize ).copy( this );

	}

	/**
	 * Serializes the timeline attribute into JSON.
	 *
	 * @return {Object} A JSON object representing the serialized timeline attribute.
	 */
	toJSON() {

		const data = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from( this.array ),
			normalized: this.normalized
		};

		data.name = this.name;
		data.usage = this.usage;
		data.gpuType = this.gpuType;

		return data;

	}

	/**
	 * Can be used to dispose storage timeline attributes. Available only in {@link SocialRenderer}.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

/**
 * Convenient class that can be used when creating a `Int8` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Int8TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Int8Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int8Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt8` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Uint8TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Uint8Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint8Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt8Clamped` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Uint8ClampedTimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Uint8ClampedArray)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint8ClampedArray( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Int16` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Int16TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Int16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int16Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt16` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Uint16TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Int32` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Int32TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Int32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Int32Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `UInt32` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Uint32TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint32Array( array ), itemSize, normalized );

	}

}

/**
 * Convenient class that can be used when creating a `Float16` timeline attribute with
 * a plain `Array` instance.
 *
 * This class automatically converts to and from FP16 via `Uint16Array` since `Float16Array`
 * browser support is still problematic.
 *
 * @augments TimelineAttribute
 */
class Float16TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

		this.isFloat16TimelineAttribute = true;

	}

	getX( index ) {

		let x = fromHalfFloat( this.array[ index * this.itemSize ] );

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = toHalfFloat( x );

		return this;

	}

	getY( index ) {

		let y = fromHalfFloat( this.array[ index * this.itemSize + 1 ] );

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = toHalfFloat( y );

		return this;

	}

	getZ( index ) {

		let z = fromHalfFloat( this.array[ index * this.itemSize + 2 ] );

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = toHalfFloat( z );

		return this;

	}

	getW( index ) {

		let w = fromHalfFloat( this.array[ index * this.itemSize + 3 ] );

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = toHalfFloat( w );

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );
		this.array[ index + 3 ] = toHalfFloat( w );

		return this;

	}

}

/**
 * Convenient class that can be used when creating a `Float32` timeline attribute with
 * a plain `Array` instance.
 *
 * @augments TimelineAttribute
 */
class Float32TimelineAttribute extends TimelineAttribute {

	/**
	 * Constructs a new timeline attribute.
	 *
	 * @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
	 * @param {number} itemSize - The item size.
	 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
	 */
	constructor( array, itemSize, normalized ) {

		super( new Float32Array( array ), itemSize, normalized );

	}

}

//

export {
	Float32TimelineAttribute,
	Float16TimelineAttribute,
	Uint32TimelineAttribute,
	Int32TimelineAttribute,
	Uint16TimelineAttribute,
	Int16TimelineAttribute,
	Uint8ClampedTimelineAttribute,
	Uint8TimelineAttribute,
	Int8TimelineAttribute,
	TimelineAttribute
};
