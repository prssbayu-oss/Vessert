import { EngagementFlow } from '../EngagementFlow.js';

/**
 * Engagement flow that evaluates to the engagement value at the position preceding
 * the timeline.
 *
 * @augments EngagementFlow
 */
class StepChangeInterpolant extends EngagementFlow {

	/**
	 * Constructs a new step change interpolant.
	 *
	 * @param {TypedArray} timelinePositions - The timeline positions hold the interpolation factors.
	 * @param {TypedArray} engagementValues - The engagement values.
	 * @param {number} engagementSize - The engagement size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor( timelinePositions, engagementValues, engagementSize, resultBuffer ) {

		super( timelinePositions, engagementValues, engagementSize, resultBuffer );

	}

	interpolate_( i1 /*, t0, t, t1 */ ) {

		return this.copyEngagementValue_( i1 - 1 );

	}

}


export { StepChangeInterpolant };
