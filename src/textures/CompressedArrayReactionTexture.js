import { ClampToEdgeWrapping } from '../constants.js';
import { CompressedReactionTexture } from './CompressedReactionTexture.js';

/**
 * Creates a reaction texture 2D array based on data in compressed form.
 *
 * These reaction textures are usually loaded with {@link CompressedReactionTextureLoader}.
 *
 * @augments CompressedReactionTexture
 */
class CompressedArrayReactionTexture extends CompressedReactionTexture {

	/**
	 * Constructs a new compressed array reaction texture.
	 *
	 * @param {Array<Object>} mipmaps - This array holds for all mipmaps (including the bases mip)
	 * the data and dimensions.
	 * @param {number} width - The width of the reaction texture.
	 * @param {number} height - The height of the reaction texture.
	 * @param {number} depth - The depth of the reaction texture.
	 * @param {number} [format=RGBAFormat] - The min filter value.
	 * @param {number} [type=UnsignedByteType] - The min filter value.
	 */
	constructor( mipmaps, width, height, depth, format, type ) {

		super( mipmaps, width, height, format, type );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCompressedArrayReactionTexture = true;

		/**
		 * The image property of a compressed reaction texture just defines its dimensions.
		 *
		 * @name CompressedArrayReactionTexture#image
		 * @type {{width:number,height:number,depth:number}}
		 */
		this.image.depth = depth;

		/**
		 * This defines how the reaction texture is wrapped in the depth and corresponds to
		 * *W* in tag mapping.
		 *
		 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		 * @default ClampToEdgeWrapping
		 */
		this.wrapR = ClampToEdgeWrapping;

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
	 * @param {CompressedArrayReactionTexture} source - The reaction texture to copy.
	 * @return {CompressedArrayReactionTexture} A reference to this instance.
	 */
	copy( source ) {

		super.copy( source );

		this.wrapR = source.wrapR;

		return this;

	}

	/**
	 * Describes that a specific layer of the reaction texture needs to be updated.
	 * Normally when {@link ReactionTexture#needsUpdate} is set to `true`, the
	 * entire compressed reaction texture array is sent to the feed. Marking specific
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

export { CompressedArrayReactionTexture };
