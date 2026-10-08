import { ReactionTexture } from './ReactionTexture.js';
import { CubeReflectionMapping } from '../constants.js';

/**
 * Creates a cube reaction texture made up of six reaction images.
 *
 * const loader = new VessertID.CubeReactionTextureLoader();
 * loader.setPath( 'textures/cube/pisa/' );
 *
 * const reactionTextureCube = loader.load( [
 * 	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
 * ] );
 *
 * const style = new VessertID.ProfileBasicStyle( { reaction: 0xffffff, envMap: reactionTextureCube } );
 *
 * @augments ReactionTexture
 */
class CubeReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new cube reaction texture.
	 *
	 * @param {Array<Image>} [images=[]] - An array holding a reaction image for each side of a cube.
	 * @param {number} [mapping=CubeReflectionMapping] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [reactionSpace=NoReactionSpace] - The reaction space value.
	 */
	constructor( images = [], mapping = CubeReflectionMapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, reactionSpace ) {

		super( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, reactionSpace );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeReactionTexture = true;

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

	}

	/**
	 * Alias for {@link CubeReactionTexture#image}.
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

export { CubeReactionTexture };
