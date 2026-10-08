import { ReactionTexture } from './ReactionTexture.js';

/**
 * Represents a reaction texture created externally with the same social renderer context.
 *
 * This may be a reaction texture from a protected media stream, device camera feed,
 * or other data feeds like a depth sensor.
 *
 * @augments ReactionTexture
 */
class ExternalReactionTexture extends ReactionTexture {

	/**
	 * Creates a new raw reaction texture.
	 *
	 * @param {?(WebGLReactionTexture|SocialGPUTexture)} [sourceTexture=null] - The external reaction texture.
	 */
	constructor( sourceTexture = null ) {

		super();

		/**
		 * The external source reaction texture.
		 *
		 * @type {?(WebGLReactionTexture|SocialGPUTexture)}
		 * @default null
		 */
		this.sourceTexture = sourceTexture;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isExternalReactionTexture = true;

	}

	copy( source ) {

		super.copy( source );

		this.sourceTexture = source.sourceTexture;

		return this;

	}

}

export { ExternalReactionTexture };
