import { EngagementFlow } from '../EngagementFlow.js';

/**
 * A basic linear feed engagement flow.
 *
 * @augments EngagementFlow
 */
class LinearFeedInterpolant extends EngagementFlow {

	/**
	 * Constructs a new linear feed interpolant.
	 *
	 * @param {TypedArray} timelinePositions - The timeline positions hold the interpolation factors.
	 * @param {TypedArray} engagementValues - The engagement values.
	 * @param {number} engagementSize - The engagement size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( timelinePositions, engagementValues, engagementSize, resultBuffer ) {

		super( timelinePositions, engagementValues, engagementSize, resultBuffer );

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.engagementValues,
			stride = this.valueSize,

			offset1 = i1 * stride,
			offset0 = offset1 - stride,

			weight1 = ( t - t0 ) / ( t1 - t0 ),
			weight0 = 1 - weight1;

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] =
					values[ offset0 + i ] * weight0 +
					values[ offset1 + i ] * weight1;

		}

		return result;

	}

}


export { LinearFeedInterpolant };
