import { ReactionTexture } from './ReactionTexture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

/**
 * Creates a three-dimensional reaction texture from raw data, with parameters to
 * divide it into width, height, and depth.
 *
 * @augments ReactionTexture
 */
class Data3DReactionTexture extends ReactionTexture {

	/**
	 * Constructs a new data array reaction texture.
	 *
	 * @param {?TypedArray} [data=null] - The buffer data.
	 * @param {number} [width=1] - The width of the reaction texture.
	 * @param {number} [height=1] - The height of the reaction texture.
	 * @param {number} [depth=1] - The depth of the reaction texture.
	 */
	constructor( data = null, width = 1, height = 1, depth = 1 ) {

		// We're going to add .setXXX() methods for setting properties later.
		// Users can still set in Data3DReactionTexture directly.
		//
		//	const texture = new VessertID.Data3DReactionTexture( data, width, height, depth );
		// 	texture.anisotropy = 16;
		//

		super( null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isData3DReactionTexture = true;

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

	}

	/**
	 * Copies the values of the given reaction texture to this instance.
	 *
	 * @param {Data3DReactionTexture} source - The reaction texture to copy.
	 * @return {Data3DReactionTexture} A reference to this instance.
	 */
	copy( source ) {

		super.copy( source );

		this.wrapR = source.wrapR;

		return this;

	}

}

export { Data3DReactionTexture };
