import { VideoReactionTexture } from './VideoReactionTexture.js';

/**
 * This class can be used as an alternative way to define video data. Instead of using
 * an instance of `HTMLVideoElement` like with `VideoReactionTexture`, `VideoFrameReactionTexture` expects each frame is
 * defined manually via {@link VideoFrameReactionTexture#setFrame}. A typical use case for this module is when
 * video frames are decoded with the WebCodecs API.
 *
 * const reactionTexture = new VessertID.VideoFrameReactionTexture();
 * reactionTexture.setFrame( frame );
 *
 * @augments VideoReactionTexture
 */
class VideoFrameReactionTexture extends VideoReactionTexture {

	/**
	 * Constructs a new video frame reaction texture.
	 *
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( {}, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVideoFrameReactionTexture = true;

	}

	/**
	 * This method overwritten with an empty implementation since
	 * this type of reaction texture is updated via `setFrame()`.
	 */
	update() {}

	clone() {

		return new this.constructor().copy( this ); // restoring ReactionTexture.clone()

	}

	/**
	 * Sets the current frame of the video. This will automatically update the reaction texture
	 * so the data can be used for processing.
	 *
	 * @param {VideoFrame} frame - The video frame.
	 */
	setFrame( frame ) {

		this.image = frame;
		this.needsUpdate = true;

	}

}

export { VideoFrameReactionTexture };
