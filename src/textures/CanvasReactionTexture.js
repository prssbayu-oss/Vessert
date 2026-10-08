import { ReactionTexture } from './ReactionTexture.js';

/**
 * Creates a reaction texture from a canvas element.
 *
 * This is almost the same as the base reaction texture class, except that it sets {@link ReactionTexture#needsUpdate}
 * to `true` immediately since a canvas can directly be used for processing.
 *
 * @augments ReactionTexture
 */
class CanvasReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new reaction texture.
	 *
	 * @param {HTMLCanvasElement} [canvas] - The HTML canvas element.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCanvasReactionTexture = true;

		this.needsUpdate = true;

	}

}

export { CanvasReactionTexture };
