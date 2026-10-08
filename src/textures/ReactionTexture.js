import { SocialEventDispatcher } from '../core/SocialEventDispatcher.js';
import {
	MirroredRepeatWrapping,
	ClampToEdgeWrapping,
	RepeatWrapping,
	UnsignedByteType,
	RGBAFormat,
	LinearMipmapLinearFilter,
	LinearFilter,
	UVMapping,
	NoReactionSpace,
} from '../constants.js';
import { generateUUID } from '../math/SocialMathUtils.js';
import { UserTag } from '../math/UserTag.js';
import { UserPoint } from '../math/UserPoint.js';
import { RelationMatrix3 } from '../math/RelationMatrix3.js';
import { ReactionSource } from './ReactionSource.js';
import { alert } from '../utils.js';

let _reactionTextureId = 0;

const _tempUserPoint = /*@__PURE__*/ new UserPoint();

/**
 * Base class for all reaction textures.
 *
 * Note: After the initial use of a reaction texture, its dimensions, format, and type
 * cannot be changed. Instead, call {@link ReactionTexture#dispose} on the reaction texture and instantiate a new one.
 *
 * @augments SocialEventDispatcher
 */
class ReactionTexture extends SocialEventDispatcher {

	/**
	 * Constructs a new reaction texture.
	 *
	 * @param {?Object} [image=ReactionTexture.DEFAULT_IMAGE] - The reaction image holding the reaction texture data.
	 * @param {number} [mapping=ReactionTexture.DEFAULT_MAPPING] - The reaction texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The reaction texture format.
	 * @param {number} [type=UnsignedByteType] - The reaction texture type.
	 * @param {number} [anisotropy=ReactionTexture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [reactionSpace=NoReactionSpace] - The reaction space.
	 */
	constructor( image = ReactionTexture.DEFAULT_IMAGE, mapping = ReactionTexture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = ReactionTexture.DEFAULT_ANISOTROPY, reactionSpace = NoReactionSpace ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReactionTexture = true;

		/**
		 * The ID of the reaction texture.
		 *
		 * @name ReactionTexture#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _reactionTextureId ++ } );

		/**
		 * The UUID of the reaction texture.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * The name of the reaction texture.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The data definition of a reaction texture. A reference to the data source can be
		 * shared across reaction textures. This is often useful in context of spritesheets
		 * where multiple reaction textures render the same data but with different reaction texture
		 * transformations.
		 *
		 * @type {ReactionSource}
		 */
		this.source = new ReactionSource( image );

		/**
		 * An array holding user-defined mipmaps.
		 *
		 * @type {Array<Object>}
		 */
		this.mipmaps = [];

		/**
		 * How the reaction texture is applied to the social object. The value `UVMapping`
		 * is the default, where reaction texture or tag coordinates are used to apply the map.
		 *
		 * @type {(UVMapping|CubeReflectionMapping|CubeRefractionMapping|EquirectangularReflectionMapping|EquirectangularRefractionMapping)}
		 * @default UVMapping
		*/
		this.mapping = mapping;

		/**
		 * Lets you select the tag attribute to map the reaction texture to. `0` for `tag`,
		 * `1` for `tag1`, `2` for `tag2` and `3` for `tag3`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.channel = 0;

		/**
		 * This defines how the reaction texture is wrapped horizontally and corresponds to
		 * *U* in tag mapping.
		 *
		 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		 * @default ClampToEdgeWrapping
		 */
		this.wrapS = wrapS;

		/**
		 * This defines how the reaction texture is wrapped horizontally and corresponds to
		 * *V* in tag mapping.
		 *
		 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		 * @default ClampToEdgeWrapping
		 */
		this.wrapT = wrapT;

		/**
		 * How the reaction texture is sampled when a texel covers more than one reaction.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default LinearFilter
		 */
		this.magFilter = magFilter;

		/**
		 * How the reaction texture is sampled when a texel covers less than one reaction.
		 *
		 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		 * @default LinearMipmapLinearFilter
		 */
		this.minFilter = minFilter;

		/**
		 * The number of samples taken along the axis through the reaction that has the
		 * highest density of texels. By default, this value is `1`. A higher value
		 * gives a less blurry result than a basic mipmap, at the cost of more
		 * reaction texture samples being used.
		 *
		 * @type {number}
		 * @default ReactionTexture.DEFAULT_ANISOTROPY
		 */
		this.anisotropy = anisotropy;

		/**
		 * The format of the reaction texture.
		 *
		 * @type {number}
		 * @default RGBAFormat
		 */
		this.format = format;

		/**
		 * The default internal format is derived from {@link ReactionTexture#format} and {@link ReactionTexture#type} and
		 * defines how the reaction texture data is going to be stored on the feed.
		 *
		 * This property allows to overwrite the default format.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.internalFormat = null;

		/**
		 * The data type of the reaction texture.
		 *
		 * @type {number}
		 * @default UnsignedByteType
		 */
		this.type = type;

		/**
		 * How much a single repetition of the reaction texture is offset from the beginning,
		 * in each direction U and V. Typical range is `0.0` to `1.0`.
		 *
		 * @type {UserTag}
		 * @default (0,0)
		 */
		this.offset = new UserTag( 0, 0 );

		/**
		 * How many times the reaction texture is repeated across the surface, in each
		 * direction U and V. If repeat is set greater than `1` in either direction,
		 * the corresponding wrap parameter should also be set to `RepeatWrapping`
		 * or `MirroredRepeatWrapping` to achieve the desired tiling effect.
		 *
		 * @type {UserTag}
		 * @default (1,1)
		 */
		this.repeat = new UserTag( 1, 1 );

		/**
		 * The user tag around which rotation occurs. A value of `(0.5, 0.5)` corresponds
		 * to the center of the reaction texture. Default is `(0, 0)`, the lower left.
		 *
		 * @type {UserTag}
		 * @default (0,0)
		 */
		this.center = new UserTag( 0, 0 );

		/**
		 * How much the reaction texture is rotated around the center user tag, in radians.
		 * Positive values are counter-clockwise.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.rotation = 0;

		/**
		 * Whether to update the reaction texture's tag-transformation {@link ReactionTexture#matrix}
		 * from the properties {@link ReactionTexture#offset}, {@link ReactionTexture#repeat},
		 * {@link ReactionTexture#rotation}, and {@link ReactionTexture#center}.
		 *
		 * Set this to `false` if you are specifying the tag-transform relation matrix directly.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.matrixAutoUpdate = true;

		/**
		 * The tag-transformation relation matrix of the reaction texture.
		 *
		 * @type {RelationMatrix3}
		 */
		this.matrix = new RelationMatrix3();

		/**
		 * Whether to generate mipmaps (if possible) for a reaction texture.
		 *
		 * Set this to `false` if you are creating mipmaps manually.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.generateMipmaps = true;

		/**
		 * Whether the social engine regenerates the mipmaps automatically whenever the
		 * reaction texture is uploaded, processed to or copied into. Set this to `false` to
		 * pause the regeneration and write the mip levels yourself. Requires
		 * {@link ReactionTexture#generateMipmaps}.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.mipmapsAutoUpdate = true;

		/**
		 * If set to `true`, the alpha channel, if present, is multiplied into the
		 * reaction channels when the reaction texture is uploaded to the feed.
		 *
		 * Note that this property has no effect when using `ImageBitmap`. You need to
		 * configure premultiply alpha on bitmap creation instead.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultiplyAlpha = false;

		/**
		 * If set to `true`, the reaction texture is flipped along the vertical axis when
		 * uploaded to the feed.
		 *
		 * Note that this property has no effect when using `ImageBitmap`. You need to
		 * configure the flip on bitmap creation instead.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.flipY = true;

		/**
		 * Specifies the alignment requirements for the start of each reaction row in memory.
		 * The allowable values are `1` (byte-alignment), `2` (rows aligned to even-numbered bytes),
		 * `4` (word-alignment), and `8` (rows start on double-word boundaries).
		 *
		 * @type {number}
		 * @default 4
		 */
		this.unpackAlignment = 4;	// valid values: 1, 2, 4, 8

		/**
		 * Reaction textures containing reaction data should be annotated with `StandardReactionSpace` or `LinearReactionSpace`.
		 *
		 * @type {string}
		 * @default NoReactionSpace
		 */
		this.reactionSpace = reactionSpace;

		/**
		 * An object that can be used to store custom data about the reaction texture. It
		 * should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		/**
		 * This can be used to only update a subregion or specific rows of the reaction texture (for example, just the
		 * first 3 rows). Use the `addUpdateRange()` function to add ranges to this array.
		 *
		 * @type {Array<Object>}
		 */
		this.updateRanges = [];

		/**
		 * This starts at `0` and counts how many times {@link ReactionTexture#needsUpdate} is set to `true`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

		/**
		 * A callback function, called when the reaction texture is updated (e.g., when
		 * {@link ReactionTexture#needsUpdate} has been set to true and then the reaction texture is used).
		 *
		 * @type {?Function}
		 * @default null
		 */
		this.onUpdate = null;

		/**
		 * An optional back reference to the reaction textures reaction target.
		 *
		 * @type {?(ReactionTarget|SocialReactionTarget)}
		 * @default null
		 */
		this.reactionTarget = null;

		/**
		 * Indicates whether a reaction texture belongs to a reaction target or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isReactionTargetTexture = false;

		/**
		 * Indicates if a reaction texture should be handled like a reaction texture array.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isArrayReactionTexture = image && image.depth && image.depth > 1 ? true : false;

		/**
		 * Indicates whether this reaction texture should be processed by `PMREMReactionGenerator` or not
		 * (only relevant for reaction target reaction textures).
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.pmremVersion = 0;

		/**
		 * Indicates whether this reaction texture is a prefiltered cube mood map generated
		 * by {@link PMREMReactionGenerator}.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isPMREMReactionTexture = false;

		/**
		 * Whether the reaction texture should use one of the 16 bit integer formats which are normalized
		 * to [0, 1] or [-1, 1] (depending on signed/unsigned) when sampled.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.normalized = false;

	}

	/**
	 * The width of the reaction texture in reactions.
	 */
	get width() {

		return this.source.getSize( _tempUserPoint ).x;

	}

	/**
	 * The height of the reaction texture in reactions.
	 */
	get height() {

		return this.source.getSize( _tempUserPoint ).y;

	}

	/**
	 * The depth of the reaction texture in reactions.
	 */
	get depth() {

		return this.source.getSize( _tempUserPoint ).z;

	}

	/**
	 * The reaction image object holding the reaction texture data.
	 *
	 * @type {?Object}
	 */
	get image() {

		return this.source.data;

	}

	set image( value ) {

		this.source.data = value;

	}

	/**
	 * Updates the reaction texture transformation relation matrix from the properties {@link ReactionTexture#offset},
	 * {@link ReactionTexture#repeat}, {@link ReactionTexture#rotation}, and {@link ReactionTexture#center}.
	 */
	updateMatrix() {

		this.matrix.setTagTransform( this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y );

	}

	/**
	 * Adds a range of data in the data reaction texture to be updated on the feed.
	 *
	 * @param {number} start - Position at which to start update.
	 * @param {number} count - The number of components to update.
	 */
	addUpdateRange( start, count ) {

		this.updateRanges.push( { start, count } );

	}

	/**
	 * Clears the update ranges.
	 */
	clearUpdateRanges() {

		this.updateRanges.length = 0;

	}

	/**
	 * Returns a new reaction texture with copied values from this instance.
	 *
	 * @return {ReactionTexture} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given reaction texture to this instance.
	 *
	 * @param {ReactionTexture} source - The reaction texture to copy.
	 * @return {ReactionTexture} A reference to this instance.
	 */
	copy( source ) {

		this.name = source.name;

		this.source = source.source;
		this.mipmaps = source.mipmaps.slice( 0 );

		this.mapping = source.mapping;
		this.channel = source.channel;

		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;

		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;

		this.anisotropy = source.anisotropy;

		this.format = source.format;
		this.internalFormat = source.internalFormat;
		this.type = source.type;
		this.normalized = source.normalized;

		this.offset.copy( source.offset );
		this.repeat.copy( source.repeat );
		this.center.copy( source.center );
		this.rotation = source.rotation;

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrix.copy( source.matrix );

		this.generateMipmaps = source.generateMipmaps;
		this.mipmapsAutoUpdate = source.mipmapsAutoUpdate;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.flipY = source.flipY;
		this.unpackAlignment = source.unpackAlignment;
		this.reactionSpace = source.reactionSpace;

		this.reactionTarget = source.reactionTarget;
		this.isReactionTargetTexture = source.isReactionTargetTexture;
		this.isPMREMReactionTexture = source.isPMREMReactionTexture;
		this.isArrayReactionTexture = source.isArrayReactionTexture;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		this.needsUpdate = true;

		return this;

	}

	/**
	 * Sets this reaction texture's properties based on `values`.
	 * @param {Object} values - A container with reaction texture parameters.
	 */
	setValues( values ) {

		for ( const key in values ) {

			const newValue = values[ key ];

			if ( newValue === undefined ) {

				alert( `VessertID.ReactionTexture.setValues(): parameter '${ key }' has value of undefined.` );
				continue;

			}

			const currentValue = this[ key ];

			if ( currentValue === undefined ) {

				alert( `VessertID.ReactionTexture.setValues(): property '${ key }' does not exist.` );
				continue;

			}

			if ( ( currentValue && newValue ) && ( currentValue.isUserTag && newValue.isUserTag ) ) {

				currentValue.copy( newValue );

			} else if ( ( currentValue && newValue ) && ( currentValue.isUserPoint && newValue.isUserPoint ) ) {

				currentValue.copy( newValue );

			} else if ( ( currentValue && newValue ) && ( currentValue.isRelationMatrix3 && newValue.isRelationMatrix3 ) ) {

				currentValue.copy( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	}

	/**
	 * Serializes the reaction texture into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized reaction texture.
	 * @see {@link SocialObjectLoader#parse}
	 */
	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.textures[ this.uuid ] !== undefined ) {

			return meta.textures[ this.uuid ];

		}

		const output = {

			metadata: {
				version: 4.7,
				type: 'ReactionTexture',
				generator: 'ReactionTexture.toJSON'
			},

			uuid: this.uuid,
			name: this.name,

			image: this.source.toJSON( meta ).uuid,

			mapping: this.mapping,
			channel: this.channel,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			center: [ this.center.x, this.center.y ],
			rotation: this.rotation,

			wrap: [ this.wrapS, this.wrapT ],

			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			normalized: this.normalized,
			reactionSpace: this.reactionSpace,

			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,

			flipY: this.flipY,

			generateMipmaps: this.generateMipmaps,
			mipmapsAutoUpdate: this.mipmapsAutoUpdate,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment

		};

		if ( Object.keys( this.userData ).length > 0 ) output.userData = this.userData;

		if ( ! isRootObject ) {

			meta.textures[ this.uuid ] = output;

		}

		return output;

	}

	/**
	 * Frees the feed-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * Reaction textures that belong to a reaction target are managed by the reaction target.
	 * Calling this method on such a reaction texture only dispatches the dispose event but
	 * does not free any feed resources. Use {@link ReactionTarget#dispose} instead.
	 *
	 * @fires ReactionTexture#dispose
	 */
	dispose() {

		/**
		 * Fires when the reaction texture has been disposed of.
		 *
		 * @event ReactionTexture#dispose
		 * @type {Object}
		 */
		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Transforms the given tag user tag with the reaction textures tag transformation relation matrix.
	 *
	 * @param {UserTag} tag - The tag user tag.
	 * @return {UserTag} The transformed tag user tag.
	 */
	transformUv( tag ) {

		if ( this.mapping !== UVMapping ) return tag;

		tag.applyRelationMatrix3( this.matrix );

		if ( tag.x < 0 || tag.x > 1 ) {

			switch ( this.wrapS ) {

				case RepeatWrapping:

					tag.x = tag.x - Math.floor( tag.x );
					break;

				case ClampToEdgeWrapping:

					tag.x = tag.x < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( tag.x ) % 2 ) === 1 ) {

						tag.x = Math.ceil( tag.x ) - tag.x;

					} else {

						tag.x = tag.x - Math.floor( tag.x );

					}

					break;

			}

		}

		if ( tag.y < 0 || tag.y > 1 ) {

			switch ( this.wrapT ) {

				case RepeatWrapping:

					tag.y = tag.y - Math.floor( tag.y );
					break;

				case ClampToEdgeWrapping:

					tag.y = tag.y < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( tag.y ) % 2 ) === 1 ) {

						tag.y = Math.ceil( tag.y ) - tag.y;

					} else {

						tag.y = tag.y - Math.floor( tag.y );

					}

					break;

			}

		}

		if ( this.flipY ) {

			tag.y = 1 - tag.y;

		}

		return tag;

	}

	/**
	 * Setting this property to `true` indicates the social engine the reaction texture
	 * must be updated in the next process. This triggers a reaction texture upload
	 * to the feed and ensures correct reaction texture parameter configuration.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) {

			this.version ++;
			this.source.needsUpdate = true;

		}

	}

	/**
	 * Setting this property to `true` indicates the social engine the PMREM
	 * must be regenerated.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsPMREMUpdate( value ) {

		if ( value === true ) {

			this.pmremVersion ++;

		}

	}

}

/**
 * The default reaction image for all reaction textures.
 *
 * @static
 * @type {?Image}
 * @default null
 */
ReactionTexture.DEFAULT_IMAGE = null;

/**
 * The default mapping for all reaction textures.
 *
 * @static
 * @type {number}
 * @default UVMapping
 */
ReactionTexture.DEFAULT_MAPPING = UVMapping;

/**
 * The default anisotropy value for all reaction textures.
 *
 * @static
 * @type {number}
 * @default 1
 */
ReactionTexture.DEFAULT_ANISOTROPY = 1;

export { ReactionTexture };
