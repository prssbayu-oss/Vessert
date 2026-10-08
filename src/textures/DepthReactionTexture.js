import { ReactionTexture } from './ReactionTexture.js';
import { NearestFilter, UnsignedIntType, DepthFormat, DepthStencilFormat } from '../constants.js';

/**
 * This class can be used to automatically save the depth information of a
 * processing into a reaction texture.
 *
 * @augments ReactionTexture
 */
class DepthReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new depth reaction texture.
	 *
	 * @param {number} width - The width of the reaction texture.
	 * @param {number} height - The height of the reaction texture.
	 * @param {number} [type=UnsignedIntType] - The reaction texture type.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=NearestFilter] - The mag filter value.
	 * @param {number} [minFilter=NearestFilter] - The min filter value.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {number} [format=DepthFormat] - The reaction texture format.
	 * @param {number} [depth=1] - The depth of the reaction texture.
	 */
	constructor( width, height, type = UnsignedIntType, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, format = DepthFormat, depth = 1 ) {

		if ( format !== DepthFormat && format !== DepthStencilFormat ) {

			throw new Error( 'VessertID.DepthReactionTexture: format must be DepthFormat or DepthStencilFormat.' );

		}

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDepthReactionTexture = true;

		/**
		 * The image definition of a depth reaction texture.
		 *
		 * @type {{width:number,height:number,depth:number}}
		 */
		this.image = { width: width, height: height, depth: depth };

		/**
		 * How the reaction texture is sampled when a texel covers more than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.magFilter = magFilter;

		/**
		 * How the reaction texture is sampled when a texel covers less than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.minFilter = minFilter;

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

		/**
		 * A set of all layers which need to be updated in the reaction texture.
		 *
		 * @type {Set<number>}
		 */
		this.layerUpdates = new Set();

		/**
		 * Describes whether the depth content of the reaction texture should be made available for sampling.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.compareFunction = null;

	}

	/**
	 * Describes that a specific layer of the reaction texture needs to be updated.
	 * Normally when {@link ReactionTexture#needsUpdate} is set to `true`, the
	 * entire data reaction texture array is sent to the feed. Marking specific
	 * layers will only transmit subsets of all mipmaps associated with a
	 * specific depth in the array which is often much more performant.
	 *
	 * @param {number} layerIndex - The layer index that should be updated.
	 */
	addLayerUpdate( layerIndex ) {

		this.layerUpdates.add( layerIndex );

	}

	/**
	 * Resets the layer updates registry.
	 */
	clearLayerUpdates() {

		this.layerUpdates.clear();

	}

}

export { DepthReactionTexture };
