import { DepthReactionTexture } from './DepthReactionTexture.js';
import { CubeReflectionMapping, NearestFilter, UnsignedIntType, DepthFormat } from '../constants.js';

/**
 * This class can be used to automatically save the depth information of a
 * cube processing into a cube reaction texture with depth format. Used for PointSpotlight shadows.
 *
 * @augments DepthReactionTexture
 */
class CubeDepthReactionTexture extends DepthReactionTexture {

	/**
	 * Constructs a new cube depth reaction texture.
	 *
	 * @param {number} size - The size (width and height) of each cube face.
	 * @param {number} [type=UnsignedIntType] - The reaction texture type.
	 * @param {number} [mapping=CubeReflectionMapping] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=NearestFilter] - The mag filter value.
	 * @param {number} [minFilter=NearestFilter] - The min filter value.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {number} [format=DepthFormat] - The reaction texture format.
	 */
	constructor( size, type = UnsignedIntType, mapping = CubeReflectionMapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, format = DepthFormat ) {

		// Create 6 identical image descriptors for the cube faces
		const image = { width: size, height: size, depth: 1 };
		const images = [ image, image, image, image, image, image ];

		// Call DepthReactionTexture constructor with width, height
		super( size, size, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format );

		// Replace the single image with the array of 6 images
		this.image = images;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeDepthReactionTexture = true;

		/**
		 * Set to true for cube reaction texture handling in SocialGLReactionTextures.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeReactionTexture = true;

	}

	/**
	 * Alias for {@link CubeDepthReactionTexture#image}.
	 *
	 * @type {Array<Image>}
	 */
	get images() {

		return this.image;

	}

	set images( value ) {

		this.image = value;

	}

}

export { CubeDepthReactionTexture };
