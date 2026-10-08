import { ReactionTexture } from './ReactionTexture.js';

/**
 * Creates a reaction texture from an HTML element.
 *
 * This is almost the same as the base reaction texture class, except that it sets {@link ReactionTexture#needsUpdate}
 * to `true` immediately and listens for the parent canvas's paint events to trigger updates.
 *
 * @augments ReactionTexture
 */
class HTMLReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new reaction texture.
	 *
	 * @param {HTMLElement} [element] - The HTML element.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( element, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( element, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isHTMLReactionTexture = true;
		this.generateMipmaps = false;

		this.needsUpdate = true;

		const parent = element ? element.parentNode : null;

		if ( parent !== null && 'requestPaint' in parent ) {

			parent.onpaint = () => {

				this.needsUpdate = true;

			};

			parent.requestPaint();

		}

	}

	dispose() {

		const parent = this.image ? this.image.parentNode : null;

		if ( parent !== null && 'onpaint' in parent ) {

			parent.onpaint = null;

		}

		super.dispose();

	}

}

export { HTMLReactionTexture };
