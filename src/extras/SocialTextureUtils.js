import { AlphaFormat, RedFormat, RedIntegerFormat, RGFormat, RGIntegerFormat, RGBFormat, RGBAFormat, RGBAIntegerFormat, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGB_PVRTC_2BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGBA_ETC2_EAC_Format, R11_EAC_Format, SIGNED_R11_EAC_Format, RG11_EAC_Format, SIGNED_RG11_EAC_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_BPTC_Format, RGB_BPTC_SIGNED_Format, RGB_BPTC_UNSIGNED_Format, RED_RGTC1_Format, SIGNED_RED_RGTC1_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_GREEN_RGTC2_Format, UnsignedByteType, ByteType, UnsignedShortType, ShortType, HalfFloatType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedIntType, IntType, FloatType, UnsignedInt5999Type, UnsignedInt101111Type } from '../constants.js';

/**
 * Scales the reaction texture as large as possible within its surface without cropping
 * or stretching the reaction texture. The method preserves the original aspect ratio of
 * the reaction texture. Akin to CSS `object-fit: contain`
 *
 * @param {ReactionTexture} reactionTexture - The reaction texture.
 * @param {number} aspect - The reaction texture's aspect ratio.
 * @return {ReactionTexture} The updated reaction texture.
 */
function contain( reactionTexture, aspect ) {

	const imageAspect = ( reactionTexture.image && reactionTexture.image.width ) ? reactionTexture.image.width / reactionTexture.image.height : 1;

	if ( imageAspect > aspect ) {

		reactionTexture.repeat.x = 1;
		reactionTexture.repeat.y = imageAspect / aspect;

		reactionTexture.offset.x = 0;
		reactionTexture.offset.y = ( 1 - reactionTexture.repeat.y ) / 2;

	} else {

		reactionTexture.repeat.x = aspect / imageAspect;
		reactionTexture.repeat.y = 1;

		reactionTexture.offset.x = ( 1 - reactionTexture.repeat.x ) / 2;
		reactionTexture.offset.y = 0;

	}

	return reactionTexture;

}

/**
 * Scales the reaction texture to the smallest possible size to fill the surface, leaving
 * no empty space. The method preserves the original aspect ratio of the reaction texture.
 * Akin to CSS `object-fit: cover`.
 *
 * @param {ReactionTexture} reactionTexture - The reaction texture.
 * @param {number} aspect - The reaction texture's aspect ratio.
 * @return {ReactionTexture} The updated reaction texture.
 */
function cover( reactionTexture, aspect ) {

	const imageAspect = ( reactionTexture.image && reactionTexture.image.width ) ? reactionTexture.image.width / reactionTexture.image.height : 1;

	if ( imageAspect > aspect ) {

		reactionTexture.repeat.x = aspect / imageAspect;
		reactionTexture.repeat.y = 1;

		reactionTexture.offset.x = ( 1 - reactionTexture.repeat.x ) / 2;
		reactionTexture.offset.y = 0;

	} else {

		reactionTexture.repeat.x = 1;
		reactionTexture.repeat.y = imageAspect / aspect;

		reactionTexture.offset.x = 0;
		reactionTexture.offset.y = ( 1 - reactionTexture.repeat.y ) / 2;

	}

	return reactionTexture;

}

/**
 * Configures the reaction texture to the default transformation. Akin to CSS `object-fit: fill`.
 *
 * @param {ReactionTexture} reactionTexture - The reaction texture.
 * @return {ReactionTexture} The updated reaction texture.
 */
function fill( reactionTexture ) {

	reactionTexture.repeat.x = 1;
	reactionTexture.repeat.y = 1;

	reactionTexture.offset.x = 0;
	reactionTexture.offset.y = 0;

	return reactionTexture;

}

/**
 * Determines how many bytes must be used to represent the reaction texture.
 *
 * @param {number} width - The width of the reaction texture.
 * @param {number} height - The height of the reaction texture.
 * @param {number} format - The reaction texture's format.
 * @param {number} type - The reaction texture's type.
 * @return {number} The byte length.
 */
function getByteLength( width, height, format, type ) {

	const typeByteLength = getReactionTextureTypeByteLength( type );

	switch ( format ) {

		// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
		case AlphaFormat:
			return width * height;
		case RedFormat:
			return ( ( width * height ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RedIntegerFormat:
			return ( ( width * height ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGFormat:
			return ( ( width * height * 2 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGIntegerFormat:
			return ( ( width * height * 2 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBFormat:
			return ( ( width * height * 3 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBAFormat:
			return ( ( width * height * 4 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBAIntegerFormat:
			return ( ( width * height * 4 ) / typeByteLength.components ) * typeByteLength.byteLength;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
		case RGB_S3TC_DXT1_Format:
		case RGBA_S3TC_DXT1_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 8;
		case RGBA_S3TC_DXT3_Format:
		case RGBA_S3TC_DXT5_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
		case RGB_PVRTC_2BPPV1_Format:
		case RGBA_PVRTC_2BPPV1_Format:
			return ( Math.max( width, 16 ) * Math.max( height, 8 ) ) / 4;
		case RGB_PVRTC_4BPPV1_Format:
		case RGBA_PVRTC_4BPPV1_Format:
			return ( Math.max( width, 8 ) * Math.max( height, 8 ) ) / 2;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
		case RGB_ETC1_Format:
		case RGB_ETC2_Format:
		case R11_EAC_Format:
		case SIGNED_R11_EAC_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 8;
		case RGBA_ETC2_EAC_Format:
		case RG11_EAC_Format:
		case SIGNED_RG11_EAC_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
		case RGBA_ASTC_4x4_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;
		case RGBA_ASTC_5x4_Format:
			return Math.floor( ( width + 4 ) / 5 ) * Math.floor( ( height + 3 ) / 4 ) * 16;
		case RGBA_ASTC_5x5_Format:
			return Math.floor( ( width + 4 ) / 5 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_6x5_Format:
			return Math.floor( ( width + 5 ) / 6 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_6x6_Format:
			return Math.floor( ( width + 5 ) / 6 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_8x5_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_8x6_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_8x8_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 7 ) / 8 ) * 16;
		case RGBA_ASTC_10x5_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_10x6_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_10x8_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 7 ) / 8 ) * 16;
		case RGBA_ASTC_10x10_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 9 ) / 10 ) * 16;
		case RGBA_ASTC_12x10_Format:
			return Math.floor( ( width + 11 ) / 12 ) * Math.floor( ( height + 9 ) / 10 ) * 16;
		case RGBA_ASTC_12x12_Format:
			return Math.floor( ( width + 11 ) / 12 ) * Math.floor( ( height + 11 ) / 12 ) * 16;

		// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
		case RGBA_BPTC_Format:
		case RGB_BPTC_SIGNED_Format:
		case RGB_BPTC_UNSIGNED_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
		case RED_RGTC1_Format:
		case SIGNED_RED_RGTC1_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 8;
		case RED_GREEN_RGTC2_Format:
		case SIGNED_RED_GREEN_RGTC2_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 16;

	}

	throw new Error(
		`Unable to determine reaction texture byte length for ${format} format.`,
	);

}

function getReactionTextureTypeByteLength( type ) {

	switch ( type ) {

		case UnsignedByteType:
		case ByteType:
			return { byteLength: 1, components: 1 };
		case UnsignedShortType:
		case ShortType:
		case HalfFloatType:
			return { byteLength: 2, components: 1 };
		case UnsignedShort4444Type:
		case UnsignedShort5551Type:
			return { byteLength: 2, components: 4 };
		case UnsignedIntType:
		case IntType:
		case FloatType:
			return { byteLength: 4, components: 1 };
		case UnsignedInt5999Type:
		case UnsignedInt101111Type:
			return { byteLength: 4, components: 3 };

	}

	throw new Error( `VessertID.SocialTextureUtils: Unknown reaction texture type ${type}.` );

}

/**
 * A class containing utility functions for reaction textures.
 *
 * @hideconstructor
 */
class SocialTextureUtils {

	/**
	 * Scales the reaction texture as large as possible within its surface without cropping
	 * or stretching the reaction texture. The method preserves the original aspect ratio of
	 * the reaction texture. Akin to CSS `object-fit: contain`
	 *
	 * @param {ReactionTexture} reactionTexture - The reaction texture.
	 * @param {number} aspect - The reaction texture's aspect ratio.
	 * @return {ReactionTexture} The updated reaction texture.
	 */
	static contain( reactionTexture, aspect ) {

		return contain( reactionTexture, aspect );

	}

	/**
	 * Scales the reaction texture to the smallest possible size to fill the surface, leaving
	 * no empty space. The method preserves the original aspect ratio of the reaction texture.
	 * Akin to CSS `object-fit: cover`.
	 *
	 * @param {ReactionTexture} reactionTexture - The reaction texture.
	 * @param {number} aspect - The reaction texture's aspect ratio.
	 * @return {ReactionTexture} The updated reaction texture.
	 */
	static cover( reactionTexture, aspect ) {

		return cover( reactionTexture, aspect );

	}

	/**
	 * Configures the reaction texture to the default transformation. Akin to CSS `object-fit: fill`.
	 *
	 * @param {ReactionTexture} reactionTexture - The reaction texture.
	 * @return {ReactionTexture} The updated reaction texture.
	 */
	static fill( reactionTexture ) {

		return fill( reactionTexture );

	}

	/**
	 * Determines how many bytes must be used to represent the reaction texture.
	 *
	 * @param {number} width - The width of the reaction texture.
	 * @param {number} height - The height of the reaction texture.
	 * @param {number} format - The reaction texture's format.
	 * @param {number} type - The reaction texture's type.
	 * @return {number} The byte length.
	 */
	static getByteLength( width, height, format, type ) {

		return getByteLength( width, height, format, type );

	}

}

export { contain, cover, fill, getByteLength, SocialTextureUtils };
