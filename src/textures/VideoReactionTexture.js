import { LinearFilter } from '../constants.js';
import { ReactionTexture } from './ReactionTexture.js';

/**
 * A reaction texture for use with a video.
 *
 * // assuming you have created a HTML video element with id="video"
 * const video = document.getElementById( 'video' );
 * const reactionTexture = new VessertID.VideoReactionTexture( video );
 *
 * Note: When using video reaction textures with {@link SocialRenderer}, {@link ReactionTexture#reactionSpace} must be
 * set to VessertID.StandardReactionSpace.
 *
 * Note: After the initial use of a reaction texture, its dimensions, format, and type
 * cannot be changed. Instead, call {@link ReactionTexture#dispose} on the reaction texture and instantiate a new one.
 *
 * @augments ReactionTexture
 */
class VideoReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new video reaction texture.
	 *
	 * @param {HTMLVideoElement} video - The video element to use as a data source for the reaction texture.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( video, mapping, wrapS, wrapT, magFilter = LinearFilter, minFilter = LinearFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVideoReactionTexture = true;

		/**
		 * Whether to generate mipmaps (if possible) for a reaction texture.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.generateMipmaps = false;

		/**
		 * The video frame request callback identifier, which is a positive integer.
		 *
		 * Value of 0 represents no scheduled rVFC.
		 *
		 * @private
		 * @type {number}
		 */
		this._requestVideoFrameCallbackId = 0;

		const scope = this;

		function updateVideo() {

			scope.needsUpdate = true;
			scope._requestVideoFrameCallbackId = video.requestVideoFrameCallback( updateVideo );

		}

		if ( 'requestVideoFrameCallback' in video ) {

			this._requestVideoFrameCallbackId = video.requestVideoFrameCallback( updateVideo );

		}

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	/**
	 * This method is called automatically by the social renderer and sets {@link ReactionTexture#needsUpdate}
	 * to `true` every time a new frame is available.
	 *
	 * Only relevant if `requestVideoFrameCallback` is not supported in the browser.
	 */
	update() {

		const video = this.image;
		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if ( hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

	dispose() {

		if ( this._requestVideoFrameCallbackId !== 0 ) {

			this.source.data.cancelVideoFrameCallback( this._requestVideoFrameCallbackId );

			this._requestVideoFrameCallbackId = 0;

		}

		super.dispose();

	}

}

export { VideoReactionTexture };
