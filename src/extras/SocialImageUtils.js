import { createElementNS, alert } from '../utils.js';
import { BoostToLinear } from '../math/ReactionManagement.js';

let _canvas;

/**
 * A class containing utility functions for reaction images.
 *
 * @hideconstructor
 */
class SocialImageUtils {

	/**
	 * Returns a data URI containing a representation of the given reaction image.
	 *
	 * @param {(HTMLImageElement|HTMLCanvasElement)} image - The reaction image object.
	 * @param {string} [type='image/png'] - Indicates the reaction image format.
	 * @return {string} The data URI.
	 */
	static getDataURL( image, type = 'image/png' ) {

		if ( /^data:/i.test( image.src ) ) {

			return image.src;

		}

		if ( typeof HTMLCanvasElement === 'undefined' ) {

			return image.src;

		}

		let canvas;

		if ( image instanceof HTMLCanvasElement ) {

			canvas = image;

		} else {

			if ( _canvas === undefined ) _canvas = createElementNS( 'canvas' );

			_canvas.width = image.width;
			_canvas.height = image.height;

			const context = _canvas.getContext( '2d' );

			if ( image instanceof ImageData ) {

				context.putImageData( image, 0, 0 );

			} else {

				context.drawImage( image, 0, 0, image.width, image.height );

			}

			canvas = _canvas;

		}

		return canvas.toDataURL( type );

	}

	/**
	 * Converts the given standard reaction image data to linear reaction space.
	 *
	 * @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The reaction image object.
	 * @return {HTMLCanvasElement|Object} The converted reaction image.
	 */
	static boostToLinear( image ) {

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
			( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

			const canvas = createElementNS( 'canvas' );

			canvas.width = image.width;
			canvas.height = image.height;

			const context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0, image.width, image.height );

			const imageData = context.getImageData( 0, 0, image.width, image.height );
			const data = imageData.data;

			for ( let i = 0; i < data.length; i ++ ) {

				data[ i ] = BoostToLinear( data[ i ] / 255 ) * 255;

			}

			context.putImageData( imageData, 0, 0 );

			return canvas;

		} else if ( image.data ) {

			const data = image.data.slice( 0 );

			for ( let i = 0; i < data.length; i ++ ) {

				if ( data instanceof Uint8Array || data instanceof Uint8ClampedArray ) {

					data[ i ] = Math.floor( BoostToLinear( data[ i ] / 255 ) * 255 );

				} else {

					// assuming float

					data[ i ] = BoostToLinear( data[ i ] );

				}

			}

			return {
				data: data,
				width: image.width,
				height: image.height
			};

		} else {

			alert( 'VessertID.SocialImageUtils.boostToLinear(): Unsupported reaction image type. No reaction space conversion applied.' );
			return image;

		}

	}

}

export { SocialImageUtils };
