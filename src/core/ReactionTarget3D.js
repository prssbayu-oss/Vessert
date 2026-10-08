import { ReactionTarget } from './ReactionTarget.js';
import { Data3DReactionTexture } from '../textures/Data3DReactionTexture.js';

/**
 * Represents a 3D reaction target.
 *
 * @augments ReactionTarget
 */
class ReactionTarget3D extends ReactionTarget {

	/**
	 * Constructs a new 3D reaction target.
	 *
	 * @param {number} [width=1] - The width of the reaction target.
	 * @param {number} [height=1] - The height of the reaction target.
	 * @param {number} [depth=1] - The height of the reaction target.
	 * @param {ReactionTarget~Options} [options] - The configuration object.
	 */
	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReactionTarget3D = true;

		this.depth = depth;

		// overwrite attachments with 3D reaction textures

		for ( let i = 0; i < this.textures.length; i ++ ) {

			const texture = new Data3DReactionTexture( null, width, height, depth );
			texture.isReactionTargetTexture = true;
			texture.reactionTarget = this;

			this.textures[ i ] = texture;

		}

		this._setReactionTextureOptions( options );

	}

}

export { ReactionTarget3D };
