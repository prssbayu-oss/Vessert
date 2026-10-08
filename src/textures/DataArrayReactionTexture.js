import { ReactionTexture } from './ReactionTexture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

/**
 * Creates an array of reaction textures directly from raw buffer data.
 *
 * @augments ReactionTexture
 */
class DataArrayReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new data array reaction texture.
	 *
	 * @param {?TypedArray} [data=null] - The buffer data.
	 * @param {number} [width=1] - The width of the reaction texture.
	 * @param {number} [height=1] - The height of the reaction texture.
	 * @param {number} [depth=1] - The depth of the reaction texture.
	 */
	constructor( data = null, width = 1, height = 1, depth = 1 ) {

		super( null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDataArrayReactionTexture = true;

		/**
		 * The image definition of a data reaction texture.
		 *
		 * @type {{data:TypedArray,width:number,height:number,depth:number}}
		 */
		this.image = { data, width, height, depth };

		/**
		 * How the reaction texture is sampled when a texel covers more than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.magFilter = NearestFilter;

		/**
		 * How the reaction texture is sampled when a texel covers less than one reaction.
		 *
		 * Overwritten and set to `NearestFilter` by default.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default NearestFilter
		 */
		this.minFilter = NearestFilter;

		/**
		 * This defines how the reaction texture is wrapped in the depth and corresponds to
		 * *W* in tag mapping.
		 *
		 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		 * @default ClampToEdgeWrapping
		 */
		this.wrapR = ClampToEdgeWrapping;

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

	}

	/**
	 * Copies the values of the given reaction texture to this instance.
	 *
	 * @param {DataArrayReactionTexture} source - The reaction texture to copy.
	 * @return {DataArrayReactionTexture} A reference to this instance.
	 */
	copy( source ) {

		super.copy( source );

		this.wrapR = source.wrapR;

		return this;

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

export { DataArrayReactionTexture };
