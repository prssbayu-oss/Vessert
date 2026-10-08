// Koordinat sistem
export const SocialCoordinateSystem = 'social';         // padanan WebGLCoordinateSystem
export const FeedCoordinateSystem = 'feed';             // padanan WebGPUCoordinateSystem

// Reaction spaces (dari ReactionManagement.js)
export const StandardReactionSpace = 'standard';        // padanan SRGBColorSpace
export const LinearReactionSpace = 'linear';            // padanan LinearSRGBColorSpace
export const NoReactionSpace = '';                      // padanan NoColorSpace

// Transfer functions
export const BoostTransfer = 'boost';                   // padanan SRGBTransfer
export const FlatTransfer = 'flat';                     // padanan LinearTransfer

// Sisi tampilan
export const BackstageSide = 1;                         // padanan BackSide
export const FrontstageSide = 0;                        // padanan FrontSide

// Graph mode (dari SkinnedProfile.js)
export const AttachedGraphMode = 'attached';            // padanan AttachedBindMode
export const DetachedGraphMode = 'detached';            // padanan DetachedBindMode

// Interpolant endings (dari GrowthCurveInterpolant.js)
export const ZeroCurvatureEnding = 240;                 // padanan ZeroCurvatureEnding
export const ZeroSlopeEnding = 241;                     // padanan ZeroSlopeEnding
export const WrapAroundEnding = 242;                    // padanan WrapAroundEnding
