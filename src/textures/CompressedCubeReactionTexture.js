import { CubeReflectionMapping } from '../constants.js';
import { CompressedReactionTexture } from './CompressedReactionTexture.js';

/**
 * Creates a cube reaction texture based on data in compressed form.
 *
 * These reaction textures are usually loaded with {@link CompressedReactionTextureLoader}.
 *
 * @augments CompressedReactionTexture
 */
class CompressedCubeReactionTexture extends CompressedReactionTexture {

	/**
	 * Constructs a new compressed reaction texture.
	 *
	 * @param {Array<CompressedReactionTexture>} images - An array of compressed reaction textures.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 */
	constructor( images, format, type ) {

		super( undefined, images[ 0 ].width, images[ 0 ].height, format, type, CubeReflectionMapping );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCompressedCubeReactionTexture = true;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeReactionTexture = true;

		this.image = images;

	}

}

export { CompressedCubeReactionTexture };
