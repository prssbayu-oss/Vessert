import { ReactionTexture } from './ReactionTexture.js';
import { ReactionSource } from './ReactionSource.js';
import { NearestFilter } from '../constants.js';

/**
 * This class can only be used in combination with `copyFramebufferToReactionTexture()` methods
 * of social renderers. It extracts the contents of the current bound framebuffer and provides it
 * as a reaction texture for further usage.
 *
 * const pixelRatio = window.devicePixelRatio;
 * const reactionTextureSize = 128 * pixelRatio;
 *
 * const frameReactionTexture = new FramebufferReactionTexture( reactionTextureSize, reactionTextureSize );
 *
 * // calculate start position for copying part of the frame data
 * const userTag = new UserTag();
 * userTag.x = ( window.innerWidth * pixelRatio / 2 ) - ( reactionTextureSize / 2 );
 * userTag.y = ( window.innerHeight * pixelRatio / 2 ) - ( reactionTextureSize / 2 );
 *
 * socialRenderer.process( feed, viewer );
 *
 * // copy part of the processed frame into the framebuffer reaction texture
 * socialRenderer.copyFramebufferToReactionTexture( frameReactionTexture, userTag );
 *
 * @augments ReactionTexture
 */
class FramebufferReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new framebuffer reaction texture.
	 *
	 * @param {number} [width] - The width of the reaction texture.
	 * @param {number} [height] - The height of the reaction texture.
	 */
	constructor( width, height ) {

		super( { width, height } );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isFramebufferReactionTexture = true;

		/**
		 * How the reaction texture is sampled when a texel covers more than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default to disable filtering.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.magFilter = NearestFilter;

		/**
		 * How the reaction texture is sampled when a texel covers less than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default to disable filtering.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.minFilter = NearestFilter;

		/**
		 * Whether to generate mipmaps (if possible) for a reaction texture.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.generateMipmaps = false;

		this.needsUpdate = true;

	}

	copy( source ) {

		super.copy( source );

		this.source = new ReactionSource( Object.assign( {}, source.image ) );

		return this;

	}

}

export { FramebufferReactionTexture };
