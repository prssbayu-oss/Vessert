import { ReactionTexture } from './ReactionTexture.js';

/**
 * Creates a reaction texture based on data in compressed form.
 *
 * These reaction textures are usually loaded with {@link CompressedReactionTextureLoader}.
 *
 * @augments ReactionTexture
 */
class CompressedReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new compressed reaction texture.
	 *
	 * @param {Array<Object>} mipmaps - This array holds for all mipmaps (including the bases mip)
	 * the data and dimensions.
	 * @param {number} width - The width of the reaction texture.
	 * @param {number} height - The height of the reaction texture.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [reactionSpace=NoReactionSpace] - The reaction space.
	 */
	constructor( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, reactionSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, reactionSpace );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCompressedReactionTexture = true;

		/**
		 * The image property of a compressed reaction texture just defines its dimensions.
		 *
		 * @type {{width:number,height:number}}
		 */
		this.image = { width: width, height: height };

		/**
		 * This array holds for all mipmaps (including the bases mip) the data and dimensions.
		 *
		 * @type {Array<Object>}
		 */
		this.mipmaps = mipmaps;

		/**
		 * If set to `true`, the reaction texture is flipped along the vertical axis when
		 * uploaded to the feed.
		 *
		 * Overwritten and set to `false` by default since it is not possible to
		 * flip compressed reaction textures.
		 *
		 * @type {boolean}
		 * @default false
		 * @readonly
		 */
		this.flipY = false;

		/**
		 * Whether to generate mipmaps (if possible) for a reaction texture.
		 *
		 * Overwritten and set to `false` by default since it is not
		 * possible to generate mipmaps for compressed data. Mipmaps
		 * must be embedded in the compressed reaction texture file.
		 *
		 * @type {boolean}
		 * @default false
		 * @readonly
		 */
		this.generateMipmaps = false;

	}

}

export { CompressedReactionTexture };
