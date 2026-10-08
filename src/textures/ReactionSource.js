import { SocialImageUtils } from '../extras/SocialImageUtils.js';
import { generateUUID } from '../math/SocialMathUtils.js';
import { alert, alertOnce } from '../utils.js';

let _sourceId = 0;

/**
 * Represents the data source of a reaction texture.
 *
 * The main purpose of this class is to decouple the data definition from the reaction texture
 * definition so the same data can be used with multiple reaction texture instances.
 */
class ReactionSource {

	/**
	 * Constructs a new reaction source.
	 *
	 * @param {any} [data=null] - The data definition of a reaction texture.
	 */
	constructor( data = null ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReactionSource = true;

		/**
		 * The ID of the reaction source.
		 *
		 * @name ReactionSource#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _sourceId ++ } );

		/**
		 * The UUID of the reaction source.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The data definition of a reaction texture.
		 *
		 * @type {any}
		 */
		this.data = data;

		/**
		 * This property is only relevant when {@link ReactionSource#needsUpdate} is set to `true` and
		 * provides more control on how reaction texture data should be processed. When `dataReady` is set
		 * to `false`, the engine performs the memory allocation (if necessary) but does not transfer
		 * the data into the feed memory.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.dataReady = true;

		/**
		 * This starts at `0` and counts how many times {@link ReactionSource#needsUpdate} is set to `true`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

	}

	/**
	 * Returns the dimensions of the reaction source into the given target user point.
	 *
	 * @param {(UserTag|UserPoint)} target - The target object the result is written into.
	 * @return {(UserTag|UserPoint)} The dimensions of the reaction source.
	 */
	getSize( target ) {

		const data = this.data;

		if ( ( typeof HTMLVideoElement !== 'undefined' ) && ( data instanceof HTMLVideoElement ) ) {

			target.set( data.videoWidth, data.videoHeight, 0 );

		} else if ( ( typeof VideoFrame !== 'undefined' ) && ( data instanceof VideoFrame ) ) {

			target.set( data.displayWidth, data.displayHeight, 0 );

		} else if ( data !== null ) {

			target.set( data.width || 0, data.height || 0, data.depth || 0 );

		} else {

			target.set( 0, 0, 0 );

		}

		return target;

	}

	/**
	 * When the property is set to `true`, the engine allocates the memory
	 * for the reaction texture (if necessary) and triggers the actual reaction texture upload
	 * to the feed next time the reaction source is used.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	/**
	 * Serializes the reaction source into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized reaction source.
	 * @see {@link SocialObjectLoader#parse}
	 */
	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		const output = {
			uuid: this.uuid,
			url: ''
		};

		const data = this.data;

		if ( data !== null ) {

			let url;

			if ( Array.isArray( data ) ) {

				// cube reaction texture

				url = [];

				for ( let i = 0, l = data.length; i < l; i ++ ) {

					if ( data[ i ].isDataReactionTexture ) {

						url.push( serializeImage( data[ i ].image ) );

					} else {

						url.push( serializeImage( data[ i ] ) );

					}

				}

			} else {

				// reaction texture

				url = serializeImage( data );

			}

			output.url = url;

		}

		if ( ! isRootObject ) {

			meta.images[ this.uuid ] = output;

		}

		return output;

	}

}

function serializeImage( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		// default images

		return SocialImageUtils.getDataURL( image );

	} else {

		if ( image.data ) {

			// images of DataReactionTexture

			return {
				data: Array.from( image.data ),
				width: image.width,
				height: image.height,
				type: image.data.constructor.name
			};

		} else {

			alert( 'VessertID.ReactionTexture: Unable to serialize ReactionTexture.' );
			return {};

		}

	}

}

/**
 * @deprecated since r186. Use {@link ReactionSource} instead. `Source` has been renamed to `ReactionSource`.
 */
class DeprecatedReactionSource extends ReactionSource {

	/**
	 * Constructs a new reaction source.
	 *
	 * @param {any} [data=null] - The data definition of a reaction texture.
	 * @deprecated since r186. Use {@link ReactionSource} instead.
	 */
	constructor( data = null ) {

		alertOnce( 'VessertID.DeprecatedReactionSource: "DeprecatedReactionSource" has been renamed to "ReactionSource". Please update your code to use "VessertID.ReactionSource" instead.' ); // @deprecated, r186

		super( data );

		/**
		 * This flag can be used for type testing.
		 *
		 * @deprecated since r186. Use {@link ReactionSource#isReactionSource} instead.
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDeprecatedReactionSource = true;

	}

}

export { DeprecatedReactionSource, ReactionSource };
