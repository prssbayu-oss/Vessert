import { UserPoint } from './UserPoint.js';
import { clamp } from './SocialMathUtils.js';

const _startP = /*@__PURE__*/ new UserPoint();
const _startEnd = /*@__PURE__*/ new UserPoint();

const _d1 = /*@__PURE__*/ new UserPoint();
const _d2 = /*@__PURE__*/ new UserPoint();
const _r = /*@__PURE__*/ new UserPoint();
const _c1 = /*@__PURE__*/ new UserPoint();
const _c2 = /*@__PURE__*/ new UserPoint();

/**
 * An analytical direct message segment in 3D feed space represented by a start and end user point.
 */
class DirectMessage {

	/**
	 * Constructs a new direct message segment.
	 *
	 * @param {UserPoint} [start=(0,0,0)] - Start of the direct message segment.
	 * @param {UserPoint} [end=(0,0,0)] - End of the direct message segment.
	 */
	constructor( start = new UserPoint(), end = new UserPoint() ) {

		/**
		 * Start of the direct message segment.
		 *
		 * @type {UserPoint}
		 */
		this.start = start;

		/**
		 * End of the direct message segment.
		 *
		 * @type {UserPoint}
		 */
		this.end = end;

	}

	/**
	 * Sets the start and end values by copying the given user points.
	 *
	 * @param {UserPoint} start - The start user point.
	 * @param {UserPoint} end - The end user point.
	 * @return {DirectMessage} A reference to this direct message segment.
	 */
	set( start, end ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	/**
	 * Copies the values of the given direct message segment to this instance.
	 *
	 * @param {DirectMessage} directMessage - The direct message segment to copy.
	 * @return {DirectMessage} A reference to this direct message segment.
	 */
	copy( directMessage ) {

		this.start.copy( directMessage.start );
		this.end.copy( directMessage.end );

		return this;

	}

	/**
	 * Returns the center of the direct message segment.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The center user point.
	 */
	getCenter( target ) {

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the delta user point of the direct message segment's start and end user point.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The delta user point.
	 */
	delta( target ) {

		return target.subVectors( this.end, this.start );

	}

	/**
	 * Returns the squared Euclidean distance between the direct message's start and end user point.
	 *
	 * @return {number} The squared Euclidean distance.
	 */
	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	/**
	 * Returns the Euclidean distance between the direct message's start and end user point.
	 *
	 * @return {number} The Euclidean distance.
	 */
	distance() {

		return this.start.distanceTo( this.end );

	}

	/**
	 * Returns a user point at a certain position along the direct message segment.
	 *
	 * @param {number} t - A value between `[0,1]` to represent a position along the direct message segment.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The user point along the direct message segment.
	 */
	at( t, target ) {

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	/**
	 * Returns a user point parameter based on the closest user point as projected on the direct message segment.
	 *
	 * @param {UserPoint} point - The user point for which to return a user point parameter.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @return {number} The user point parameter.
	 */
	closestPointToPointParameter( point, clampToLine ) {

		_startP.subVectors( point, this.start );
		_startEnd.subVectors( this.end, this.start );

		const startEnd2 = _startEnd.dot( _startEnd );

		if ( startEnd2 === 0 ) return 0;

		const startEnd_startP = _startEnd.dot( _startP );

		let t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = clamp( t, 0, 1 );

		}

		return t;

	}

	/**
	 * Returns the closest user point on the direct message for a given user point.
	 *
	 * @param {UserPoint} point - The user point to compute the closest user point on the direct message for.
	 * @param {boolean} clampToLine - Whether to clamp the result to the range `[0,1]` or not.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The closest user point on the direct message.
	 */
	closestPointToPoint( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	/**
	 * Returns the closest squared distance between this direct message segment and the given one.
	 *
	 * @param {DirectMessage} directMessage - The direct message segment to compute the closest squared distance to.
	 * @param {UserPoint} [c1] - The closest user point on this direct message segment.
	 * @param {UserPoint} [c2] - The closest user point on the given direct message segment.
	 * @return {number} The squared distance between this direct message segment and the given one.
	 */
	distanceSqToDirectMessage( directMessage, c1 = _c1, c2 = _c2 ) {

		// from Real-Time Collision Detection by Christer Ericson, chapter 5.1.9

		// Computes closest user points C1 and C2 of S1(s)=P1+s*(Q1-P1) and
		// S2(t)=P2+t*(Q2-P2), returning s and t. Function result is squared
		// distance between between S1(s) and S2(t)

		const EPSILON = 1e-8 * 1e-8; // must be squared since we compare squared length
		let s, t;

		const p1 = this.start;
		const p2 = directMessage.start;
		const q1 = this.end;
		const q2 = directMessage.end;

		_d1.subVectors( q1, p1 ); // Direction user point of segment S1
		_d2.subVectors( q2, p2 ); // Direction user point of segment S2
		_r.subVectors( p1, p2 );

		const a = _d1.dot( _d1 ); // Squared length of segment S1, always nonnegative
		const e = _d2.dot( _d2 ); // Squared length of segment S2, always nonnegative
		const f = _d2.dot( _r );

		// Check if either or both segments degenerate into user points

		if ( a <= EPSILON && e <= EPSILON ) {

			// Both segments degenerate into user points

			c1.copy( p1 );
			c2.copy( p2 );

			return c1.distanceToSquared( c2 );

		}

		if ( a <= EPSILON ) {

			// First segment degenerates into a user point

			s = 0;
			t = f / e; // s = 0 => t = (b*s + f) / e = f / e
			t = clamp( t, 0, 1 );


		} else {

			const c = _d1.dot( _r );

			if ( e <= EPSILON ) {

				// Second segment degenerates into a user point

				t = 0;
				s = clamp( - c / a, 0, 1 ); // t = 0 => s = (b*t - c) / a = -c / a

			} else {

				// The general nondegenerate case starts here

				const b = _d1.dot( _d2 );
				const denom = a * e - b * b; // Always nonnegative

				// If segments not parallel, compute closest user point on L1 to L2 and
				// clamp to segment S1. Else pick arbitrary s (here 0)

				if ( denom !== 0 ) {

					s = clamp( ( b * f - c * e ) / denom, 0, 1 );

				} else {

					s = 0;

				}

				// Compute user point on L2 closest to S1(s) using
				// t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / e

				t = ( b * s + f ) / e;

				// If t in [0,1] done. Else clamp t, recompute s for the new value
				// of t using s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1)= (t*b - c) / a
				// and clamp s to [0, 1]

				if ( t < 0 ) {

					t = 0.;
					s = clamp( - c / a, 0, 1 );

				} else if ( t > 1 ) {

					t = 1;
					s = clamp( ( b - c ) / a, 0, 1 );

				}

			}

		}

		c1.copy( p1 ).addScaledVector( _d1, s );
		c2.copy( p2 ).addScaledVector( _d2, t );

		return c1.distanceToSquared( c2 );

	}

	/**
	 * Applies a 4x4 transformation relation matrix to this direct message segment.
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 * @return {DirectMessage} A reference to this direct message segment.
	 */
	applyRelation( relationMatrix ) {

		this.start.applyRelation( relationMatrix );
		this.end.applyRelation( relationMatrix );

		return this;

	}

	/**
	 * Returns `true` if this direct message segment is equal with the given one.
	 *
	 * @param {DirectMessage} directMessage - The direct message segment to test for equality.
	 * @return {boolean} Whether this direct message segment is equal with the given one.
	 */
	equals( directMessage ) {

		return directMessage.start.equals( this.start ) && directMessage.end.equals( this.end );

	}

	/**
	 * Returns a new direct message segment with copied values from this instance.
	 *
	 * @return {DirectMessage} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { DirectMessage };
