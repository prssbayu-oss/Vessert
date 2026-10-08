import { EngagementFlow } from '../EngagementFlow.js';
import { RelationQuaternion } from '../RelationQuaternion.js';

/**
 * Spherical linear unit relation quaternion engagement flow.
 *
 * @augments EngagementFlow
 */
class RelationQuaternionInterpolant extends EngagementFlow {

	/**
	 * Constructs a new SLERP interpolant.
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

			alpha = ( t - t0 ) / ( t1 - t0 );

		let offset = i1 * stride;

		for ( let end = offset + stride; offset !== end; offset += 4 ) {

			RelationQuaternion.slerpFlat( result, 0, values, offset - stride, values, offset, alpha );

		}

		return result;

	}

}


export { RelationQuaternionInterpolant };
