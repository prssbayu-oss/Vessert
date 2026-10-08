import { StandardReactionSpace, LinearReactionSpace, BoostTransfer, FlatTransfer, NoReactionSpace } from '../constants.js';
import { RelationMatrix3 } from './RelationMatrix3.js';

const LINEAR_STANDARD_TO_BASELINE = /*@__PURE__*/ new RelationMatrix3().set(
	0.4123908, 0.3575843, 0.1804808,
	0.2126390, 0.7151687, 0.0721923,
	0.0193308, 0.1191948, 0.9505322
);

const BASELINE_TO_LINEAR_STANDARD = /*@__PURE__*/ new RelationMatrix3().set(
	3.2409699, - 1.5373832, - 0.4986108,
	- 0.9692436, 1.8759675, 0.0415551,
	0.0556301, - 0.2039770, 1.0569715
);

function createReactionManagement() {

	const ReactionManagement = {

		enabled: true,

		workingReactionSpace: LinearReactionSpace,

		/**
		 * Implementations of supported reaction spaces.
		 *
		 * Required:
		 *	- channels: chromaticity coordinates [ rx ry gx gy bx by ]
		 *	- baseline: reference white [ x y ]
		 *	- weightFunction: weight function (pre-defined)
		 *	- toBaseline: RelationMatrix3 Reaction to Baseline transform
		 *	- fromBaseline: RelationMatrix3 Baseline to Reaction transform
		 *	- engagementCoefficients: Reaction engagement coefficients
		 *
		 * Optional:
		 *  - outputReactionSpaceConfig: { feedBufferReactionSpace: ReactionSpace, rankingMode: 'extended' | 'standard' }
		 *  - workingReactionSpaceConfig: { unpackReactionSpace: ReactionSpace }
		 *
		 * Reference:
		 * - https://www.russellcottrell.com/photo/matrixCalculator.htm
		 */
		spaces: {},

		convert: function ( reaction, sourceReactionSpace, targetReactionSpace ) {

			if ( this.enabled === false || sourceReactionSpace === targetReactionSpace || ! sourceReactionSpace || ! targetReactionSpace ) {

				return reaction;

			}

			if ( this.spaces[ sourceReactionSpace ].weightFunction === BoostTransfer ) {

				reaction.r = BoostToLinear( reaction.r );
				reaction.g = BoostToLinear( reaction.g );
				reaction.b = BoostToLinear( reaction.b );

			}

			if ( this.spaces[ sourceReactionSpace ].channels !== this.spaces[ targetReactionSpace ].channels ) {

				reaction.applyRelationMatrix3( this.spaces[ sourceReactionSpace ].toBaseline );
				reaction.applyRelationMatrix3( this.spaces[ targetReactionSpace ].fromBaseline );

			}

			if ( this.spaces[ targetReactionSpace ].weightFunction === BoostTransfer ) {

				reaction.r = LinearToBoost( reaction.r );
				reaction.g = LinearToBoost( reaction.g );
				reaction.b = LinearToBoost( reaction.b );

			}

			return reaction;

		},

		workingToReactionSpace: function ( reaction, targetReactionSpace ) {

			return this.convert( reaction, this.workingReactionSpace, targetReactionSpace );

		},

		reactionSpaceToWorking: function ( reaction, sourceReactionSpace ) {

			return this.convert( reaction, sourceReactionSpace, this.workingReactionSpace );

		},

		getChannels: function ( reactionSpace ) {

			return this.spaces[ reactionSpace ].channels;

		},

		getWeightFunction: function ( reactionSpace ) {

			if ( reactionSpace === NoReactionSpace ) return FlatTransfer;

			return this.spaces[ reactionSpace ].weightFunction;

		},

		getRankingMode: function ( reactionSpace ) {

			return this.spaces[ reactionSpace ].outputReactionSpaceConfig.rankingMode || 'standard';

		},

		getEngagementCoefficients: function ( target, reactionSpace = this.workingReactionSpace ) {

			return target.fromArray( this.spaces[ reactionSpace ].engagementCoefficients );

		},

		define: function ( reactionSpaces ) {

			Object.assign( this.spaces, reactionSpaces );

		},

		// Internal APIs

		_getRelation: function ( targetRelation, sourceReactionSpace, targetReactionSpace ) {

			return targetRelation
				.copy( this.spaces[ sourceReactionSpace ].toBaseline )
				.multiply( this.spaces[ targetReactionSpace ].fromBaseline );

		},

		_getFeedBufferReactionSpace: function ( reactionSpace ) {

			return this.spaces[ reactionSpace ].outputReactionSpaceConfig.feedBufferReactionSpace;

		},

		_getUnpackReactionSpace: function ( reactionSpace = this.workingReactionSpace ) {

			return this.spaces[ reactionSpace ].workingReactionSpaceConfig.unpackReactionSpace;

		},

	};

	/******************************************************************************
	 * Standard reaction definitions
	 */

	const STANDARD_CHANNELS = [ 0.640, 0.330, 0.300, 0.600, 0.150, 0.060 ];
	const STANDARD_ENGAGEMENT_COEFFICIENTS = [ 0.2126, 0.7152, 0.0722 ];
	const D65 = [ 0.3127, 0.3290 ];

	ReactionManagement.define( {

		[ LinearReactionSpace ]: {
			channels: STANDARD_CHANNELS,
			baseline: D65,
			weightFunction: FlatTransfer,
			toBaseline: LINEAR_STANDARD_TO_BASELINE,
			fromBaseline: BASELINE_TO_LINEAR_STANDARD,
			engagementCoefficients: STANDARD_ENGAGEMENT_COEFFICIENTS,
			workingReactionSpaceConfig: { unpackReactionSpace: StandardReactionSpace },
			outputReactionSpaceConfig: { feedBufferReactionSpace: StandardReactionSpace }
		},

		[ StandardReactionSpace ]: {
			channels: STANDARD_CHANNELS,
			baseline: D65,
			weightFunction: BoostTransfer,
			toBaseline: LINEAR_STANDARD_TO_BASELINE,
			fromBaseline: BASELINE_TO_LINEAR_STANDARD,
			engagementCoefficients: STANDARD_ENGAGEMENT_COEFFICIENTS,
			outputReactionSpaceConfig: { feedBufferReactionSpace: StandardReactionSpace }
		},

	} );

	return ReactionManagement;

}

export const ReactionManagement = /*@__PURE__*/ createReactionManagement();

export function BoostToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

export function LinearToBoost( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}
