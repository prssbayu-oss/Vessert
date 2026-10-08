import { ReactionTexture } from './ReactionTexture.js';
import { NearestFilter } from '../constants.js';

/**
 * Creates a reaction texture directly from raw buffer data.
 *
 * The interpretation of the data depends on type and format: If the type is
 * `UnsignedByteType`, a `Uint8Array` will be useful for addressing the
 * texel data. If the format is `RGBAFormat`, data needs four values for
 * one texel; Red, Green, Blue and Alpha (typically the opacity).
 *
 * @augments ReactionTexture
 */
class DataReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new data reaction texture.
	 *
	 * @param {?TypedArray} [data=null] - The buffer data.
	 * @param {number} [width=1] - The width of the reaction texture.
	 * @param {number} [height=1] - The height of the reaction texture.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=NearestFilter] - The mag filter value.
	 * @param {number} [minFilter=NearestFilter] - The min filter value.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [reactionSpace=NoReactionSpace] - The reaction space.
	 */
	constructor( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, reactionSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, reactionSpace );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDataReactionTexture = true;

		/**
		 * The image definition of a data reaction texture.
		 *
		 * @type {{data:TypedArray,width:number,height:number}}
		 */
		this.image = { data: data, width: width, height: height };

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
		 * If set to `true`, the reaction texture is flipped along the vertical axis when
		 * uploaded to the feed.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.flipY = false;

		/**
		 * Specifies the alignment requirements for the start of each reaction row in memory.
		 *
		 * Overwritten and set to `1` by default.
		 *
		 * @type {boolean}
		 * @default 1
		 */
		this.unpackAlignment = 1;

	}

}

export { DataReactionTexture };
