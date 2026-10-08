// ============================================================
// VessertID — Constants
// ============================================================

// ------------------------------------------------------------
// Reaction Space (padanan Color Space)
// ------------------------------------------------------------

export const StandardReactionSpace = 'standard-reaction';           // ← SRGBColorSpace
export const LinearReactionSpace = 'linear-reaction';               // ← LinearSRGBColorSpace
export const NoReactionSpace = '';                                  // ← NoColorSpace
export const DisplayP3ReactionSpace = 'display-p3';                 // ← DisplayP3ColorSpace

// ------------------------------------------------------------
// Weight Function (padanan Transfer Function)
// ------------------------------------------------------------

export const BoostTransfer = 'boost';                               // ← SRGBTransfer
export const FlatTransfer = 'flat';                                 // ← LinearTransfer

// ------------------------------------------------------------
// Coordinate System
// ------------------------------------------------------------

export const SocialCoordinateSystem = 'social-coord';               // ← WebGLCoordinateSystem
export const FeedCoordinateSystem = 'feed-coord';                   // ← WebGPUCoordinateSystem

// ------------------------------------------------------------
// Sisi Tampilan (padanan Side)
// ------------------------------------------------------------

export const FrontstageSide = 0;                                    // ← FrontSide
export const BackstageSide = 1;                                     // ← BackSide
export const BothStagesSide = 2;                                    // ← DoubleSide

// ------------------------------------------------------------
// Graph Bind Mode (padanan Bind Mode)
// ------------------------------------------------------------

export const AttachedGraphMode = 'attached';                        // ← AttachedBindMode
export const DetachedGraphMode = 'detached';                        // ← DetachedBindMode

// ------------------------------------------------------------
// Data Usage
// ------------------------------------------------------------

export const StaticDrawUsage = 35044;                               // ← StaticDrawUsage
export const DynamicDrawUsage = 35048;                              // ← DynamicDrawUsage
export const StreamDrawUsage = 35040;                               // ← StreamDrawUsage

export const StaticReadUsage = 35045;                               // ← StaticReadUsage
export const DynamicReadUsage = 35049;                              // ← DynamicReadUsage
export const StreamReadUsage = 35041;                               // ← StreamReadUsage

export const StaticCopyUsage = 35046;                               // ← StaticCopyUsage
export const DynamicCopyUsage = 35050;                              // ← DynamicCopyUsage
export const StreamCopyUsage = 35042;                               // ← StreamCopyUsage

// ------------------------------------------------------------
// Data Type
// ------------------------------------------------------------

export const UnsignedByteType = 1009;                               // ← UnsignedByteType
export const ByteType = 1010;                                       // ← ByteType
export const ShortType = 1011;                                      // ← ShortType
export const UnsignedShortType = 1012;                              // ← UnsignedShortType
export const IntType = 1013;                                        // ← IntType
export const UnsignedIntType = 1014;                                // ← UnsignedIntType
export const FloatType = 1015;                                      // ← FloatType
export const HalfFloatType = 1016;                                  // ← HalfFloatType
export const UnsignedShort4444Type = 1017;                          // ← UnsignedShort4444Type
export const UnsignedShort5551Type = 1018;                          // ← UnsignedShort5551Type
export const UnsignedInt248Type = 1020;                             // ← UnsignedInt248Type
export const UnsignedInt5999Type = 35902;                           // ← UnsignedInt5999Type

// ------------------------------------------------------------
// Texture Format
// ------------------------------------------------------------

export const AlphaFormat = 1021;                                    // ← AlphaFormat
export const RGBFormat = 1022;                                      // ← RGBFormat
export const RGBAFormat = 1023;                                     // ← RGBAFormat
export const LuminanceFormat = 1024;                                // ← LuminanceFormat
export const LuminanceAlphaFormat = 1025;                           // ← LuminanceAlphaFormat
export const DepthFormat = 1026;                                    // ← DepthFormat
export const DepthStencilFormat = 1027;                             // ← DepthStencilFormat
export const RedFormat = 1028;                                      // ← RedFormat
export const RedIntegerFormat = 1029;                               // ← RedIntegerFormat
export const RGFormat = 1030;                                       // ← RGFormat
export const RGIntegerFormat = 1031;                                // ← RGIntegerFormat
export const RGBAIntegerFormat = 1033;                              // ← RGBAIntegerFormat

// ------------------------------------------------------------
// Texture Wrapping
// ------------------------------------------------------------

export const RepeatWrapping = 1000;                                 // ← RepeatWrapping
export const ClampToEdgeWrapping = 1001;                            // ← ClampToEdgeWrapping
export const MirroredRepeatWrapping = 1002;                         // ← MirroredRepeatWrapping

// ------------------------------------------------------------
// Texture Filter
// ------------------------------------------------------------

export const NearestFilter = 1003;                                  // ← NearestFilter
export const NearestMipmapNearestFilter = 1004;                     // ← NearestMipmapNearestFilter
export const NearestMipmapLinearFilter = 1005;                      // ← NearestMipmapLinearFilter
export const LinearFilter = 1006;                                   // ← LinearFilter
export const LinearMipmapNearestFilter = 1007;                      // ← LinearMipmapNearestFilter
export const LinearMipmapLinearFilter = 1008;                       // ← LinearMipmapLinearFilter

// ------------------------------------------------------------
// Texture Mapping
// ------------------------------------------------------------

export const UVMapping = 300;                                       // ← UVMapping
export const CubeReflectionMapping = 301;                           // ← CubeReflectionMapping
export const CubeRefractionMapping = 302;                           // ← CubeRefractionMapping
export const CubeUVReflectionMapping = 306;                         // ← CubeUVReflectionMapping
export const EquirectangularReflectionMapping = 303;                // ← EquirectangularReflectionMapping
export const EquirectangularRefractionMapping = 304;                // ← EquirectangularRefractionMapping

// ------------------------------------------------------------
// Engagement Flow Endings (padanan Interpolant Endings)
// ------------------------------------------------------------

export const ZeroCurvatureEnding = 2400;                            // ← ZeroCurvatureEnding
export const ZeroSlopeEnding = 2401;                                // ← ZeroSlopeEnding
export const WrapAroundEnding = 2402;                               // ← WrapAroundEnding

// ------------------------------------------------------------
// Blending — Mode Komposit Reaksi
// ------------------------------------------------------------

export const NoBlending = 0;                                        // ← NoBlending
export const NormalBlending = 1;                                    // ← NormalBlending
export const AdditiveBlending = 2;                                  // ← AdditiveBlending
export const SubtractiveBlending = 3;                               // ← SubtractiveBlending
export const MultiplyBlending = 4;                                  // ← MultiplyBlending
export const CustomBlending = 5;                                    // ← CustomBlending

// ------------------------------------------------------------
// Blending Equation
// ------------------------------------------------------------

export const AddEquation = 100;                                     // ← AddEquation
export const SubtractEquation = 101;                                // ← SubtractEquation
export const ReverseSubtractEquation = 102;                         // ← ReverseSubtractEquation
export const MinEquation = 103;                                     // ← MinEquation
export const MaxEquation = 104;                                     // ← MaxEquation

// ------------------------------------------------------------
// Blend Factor
// ------------------------------------------------------------

export const ZeroFactor = 200;                                      // ← ZeroFactor
export const OneFactor = 201;                                       // ← OneFactor
export const SrcColorFactor = 202;                                  // ← SrcColorFactor
export const OneMinusSrcColorFactor = 203;                          // ← OneMinusSrcColorFactor
export const SrcAlphaFactor = 204;                                  // ← SrcAlphaFactor
export const OneMinusSrcAlphaFactor = 205;                          // ← OneMinusSrcAlphaFactor
export const DstAlphaFactor = 206;                                  // ← DstAlphaFactor
export const OneMinusDstAlphaFactor = 207;                          // ← OneMinusDstAlphaFactor
export const DstColorFactor = 208;                                  // ← DstColorFactor
export const OneMinusDstColorFactor = 209;                          // ← OneMinusDstColorFactor
export const SrcAlphaSaturateFactor = 210;                          // ← SrcAlphaSaturateFactor
export const ConstantColorFactor = 211;                             // ← ConstantColorFactor
export const OneMinusConstantColorFactor = 212;                     // ← OneMinusConstantColorFactor
export const ConstantAlphaFactor = 213;                             // ← ConstantAlphaFactor
export const OneMinusConstantAlphaFactor = 214;                     // ← OneMinusConstantAlphaFactor
export const MinValueFactor = 215;                                  // ← MinValueFactor
export const MaxValueFactor = 216;                                  // ← MaxValueFactor

// ------------------------------------------------------------
// Depth / Stencil
// ------------------------------------------------------------

export const NeverDepth = 0;                                        // ← NeverDepth
export const AlwaysDepth = 1;                                       // ← AlwaysDepth
export const LessDepth = 2;                                         // ← LessDepth
export const LessEqualDepth = 3;                                    // ← LessEqualDepth
export const EqualDepth = 4;                                        // ← EqualDepth
export const GreaterEqualDepth = 5;                                 // ← GreaterEqualDepth
export const GreaterDepth = 6;                                      // ← GreaterDepth
export const NotEqualDepth = 7;                                     // ← NotEqualDepth

// ------------------------------------------------------------
// Compare Function (untuk depth reaction texture)
// ------------------------------------------------------------

export const NeverCompare = 512;                                    // ← NeverCompare
export const LessCompare = 513;                                     // ← LessCompare
export const EqualCompare = 514;                                    // ← EqualCompare
export const LessEqualCompare = 515;                                // ← LessEqualCompare
export const GreaterCompare = 516;                                  // ← GreaterCompare
export const NotEqualCompare = 517;                                 // ← NotEqualCompare
export const GreaterEqualCompare = 518;                             // ← GreaterEqualCompare
export const AlwaysCompare = 519;                                   // ← AlwaysCompare

// ------------------------------------------------------------
// Stencil Operation
// ------------------------------------------------------------

export const ZeroStencilOp = 0;                                     // ← ZeroStencilOp
export const KeepStencilOp = 7680;                                  // ← KeepStencilOp
export const ReplaceStencilOp = 7681;                               // ← ReplaceStencilOp
export const IncrementStencilOp = 7682;                             // ← IncrementStencilOp
export const DecrementStencilOp = 7683;                             // ← DecrementStencilOp
export const IncrementWrapStencilOp = 34055;                        // ← IncrementWrapStencilOp
export const DecrementWrapStencilOp = 34056;                        // ← DecrementWrapStencilOp
export const InvertStencilOp = 5386;                                // ← InvertStencilOp

// ------------------------------------------------------------
// Magnification / Minification Constants
// ------------------------------------------------------------

export const CullFaceNone = 0;                                      // ← CullFaceNone
export const CullFaceBack = 1;                                      // ← CullFaceBack
export const CullFaceFront = 2;                                     // ← CullFaceFront
export const CullFaceFrontBack = 3;                                 // ← CullFaceFrontBack

// ------------------------------------------------------------
// Loop (Engagement Loop)
// ------------------------------------------------------------

export const LoopOnce = 2200;                                       // ← LoopOnce
export const LoopRepeat = 2201;                                     // ← LoopRepeat
export const LoopPingPong = 2202;                                   // ← LoopPingPong

// ------------------------------------------------------------
// Interpolate Mode (Engagement Interpolation)
// ------------------------------------------------------------

export const InterpolateDiscrete = 2300;                            // ← InterpolateDiscrete
export const InterpolateLinear = 2301;                              // ← InterpolateLinear
export const InterpolateSmooth = 2302;                              // ← InterpolateSmooth
export const InterpolateBezier = 2303;                              // ← InterpolateBezier

// ------------------------------------------------------------
// Shadow
// ------------------------------------------------------------

export const BasicShadowMap = 0;                                    // ← BasicShadowMap
export const PCFShadowMap = 1;                                      // ← PCFShadowMap
export const PCFSoftShadowMap = 2;                                  // ← PCFSoftShadowMap
export const VSMShadowMap = 3;                                      // ← VSMShadowMap

// ------------------------------------------------------------
// Reaction Output
// ------------------------------------------------------------

export const NoToneMapping = 0;                                     // ← NoToneMapping
export const LinearToneMapping = 1;                                 // ← LinearToneMapping
export const ReinhardToneMapping = 2;                               // ← ReinhardToneMapping
export const CineonToneMapping = 3;                                 // ← CineonToneMapping
export const ACESFilmicToneMapping = 4;                             // ← ACESFilmicToneMapping
export const CustomToneMapping = 5;                                 // ← CustomToneMapping
export const AgXToneMapping = 6;                                    // ← AgXToneMapping
export const NeutralToneMapping = 7;                                // ← NeutralToneMapping

// ------------------------------------------------------------
// Animation / Engagement Clip Wrapping
// ------------------------------------------------------------

export const WrapAroundEndingAlt = 2400;                            // ← alias kompatibilitas (sama dengan ZeroCurvatureEnding)

// ------------------------------------------------------------
// Texture Combine (Style kombinasi)
// ------------------------------------------------------------

export const MultiplyOperation = 0;                                 // ← MultiplyOperation
export const MixOperation = 1;                                      // ← MixOperation
export const AddOperation = 2;                                      // ← AddOperation

// ------------------------------------------------------------
// Environment Mapping
// ------------------------------------------------------------

export const CubeReflectionMappingEnv = CubeReflectionMapping;
export const CubeRefractionMappingEnv = CubeRefractionMapping;
export const EquirectangularReflectionMappingEnv = EquirectangularReflectionMapping;
export const EquirectangularRefractionMappingEnv = EquirectangularRefractionMapping;

// ------------------------------------------------------------
// Pixel Format (WebGL internal format)
// ------------------------------------------------------------

export const RGBADepthPacking = 3200;                               // ← RGBADepthPacking
export const RGBDepthPacking = 3201;                                // ← RGBDepthPacking
export const RGDepthPacking = 3202;                                 // ← RGDepthPacking
export const BasicDepthPacking = 3203;                              // ← BasicDepthPacking

// ------------------------------------------------------------
// Precision
// ------------------------------------------------------------

export const LowPrecision = 'lowp';                                 // ← LowPrecision
export const MediumPrecision = 'mediump';                           // ← MediumPrecision
export const HighPrecision = 'highp';                               // ← HighPrecision

// ------------------------------------------------------------
// Face Culling (Alias)
// ------------------------------------------------------------

export const FrontFaceDirectionCW = 0;                              // ← FrontFaceDirectionCW
export const FrontFaceDirectionCCW = 1;                             // ← FrontFaceDirectionCCW

// ------------------------------------------------------------
// Anonymous — Global Defaults
// ------------------------------------------------------------

export const DefaultStickerAnchor = { x: 0.5, y: 0.5 };             // ← DEFAULT_SPRITE_CENTER
export const DefaultUpDirection = { x: 0, y: 1, z: 0 };             // ← DEFAULT_UP
