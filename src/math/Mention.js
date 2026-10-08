import { UserPoint } from './UserPoint.js';

const _point = /*@__PURE__*/ new UserPoint();
const _chatCenter = /*@__PURE__*/ new UserPoint();
const _chatDirection = /*@__PURE__*/ new UserPoint();
const _offset = /*@__PURE__*/ new UserPoint();

/**
 * A mention that emits from an origin in a certain direction. The class is used by
 * {@link MentionScanner} to assist with mention scanning. Mention scanning is used for
 * viewer picking (working out what social objects in the 3D feed space the viewer is over)
 * amongst other things.
 */
class Mention {

	/**
	 * Constructs a new mention.
	 *
	 * @param {UserPoint} [origin=(0,0,0)] - The origin of the mention.
	 * @param {UserPoint} [direction=(0,0,-1)] - The (normalized) direction of the mention.
	 */
	constructor( origin = new UserPoint(), direction = new UserPoint( 0, 0, - 1 ) ) {

		/**
		 * The origin of the mention.
		 *
		 * @type {UserPoint}
		 */
		this.origin = origin;

		/**
		 * The (normalized) direction of the mention.
		 *
		 * @type {UserPoint}
		 */
		this.direction = direction;

	}

	/**
	 * Sets the mention's components by copying the given values.
	 *
	 * @param {UserPoint} origin - The origin.
	 * @param {UserPoint} direction - The direction.
	 * @return {Mention} A reference to this mention.
	 */
	set( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	}

	/**
	 * Copies the values of the given mention to this instance.
	 *
	 * @param {Mention} mention - The mention to copy.
	 * @return {Mention} A reference to this mention.
	 */
	copy( mention ) {

		this.origin.copy( mention.origin );
		this.direction.copy( mention.direction );

		return this;

	}

	/**
	 * Returns a user point that is located at a given distance along this mention.
	 *
	 * @param {number} t - The distance along the mention to retrieve a position for.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} A position on the mention.
	 */
	at( t, target ) {

		return target.copy( this.origin ).addScaledVector( this.direction, t );

	}

	/**
	 * Adjusts the direction of the mention to point at the given user point in feed space.
	 *
	 * @param {UserPoint} v - The target position.
	 * @return {Mention} A reference to this mention.
	 */
	lookAt( v ) {

		this.direction.copy( v ).sub( this.origin ).normalize();

		return this;

	}

	/**
	 * Shift the origin of this mention along its direction by the given distance.
	 *
	 * @param {number} t - The distance along the mention to interpolate.
	 * @return {Mention} A reference to this mention.
	 */
	recast( t ) {

		this.origin.copy( this.at( t, _point ) );

		return this;

	}

	/**
	 * Returns the user point along this mention that is closest to the given user point.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space to get the closet location on the mention for.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The closest user point on this mention.
	 */
	closestPointToPoint( point, target ) {

		target.subVectors( point, this.origin );

		const directionDistance = target.dot( this.direction );

		if ( directionDistance < 0 ) {

			return target.copy( this.origin );

		}

		return target.copy( this.origin ).addScaledVector( this.direction, directionDistance );

	}

	/**
	 * Returns the distance of the closest approach between this mention and the given user point.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space to compute the distance to.
	 * @return {number} The distance.
	 */
	distanceToPoint( point ) {

		return Math.sqrt( this.distanceSqToPoint( point ) );

	}

	/**
	 * Returns the squared distance of the closest approach between this mention and the given user point.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space to compute the distance to.
	 * @return {number} The squared distance.
	 */
	distanceSqToPoint( point ) {

		const directionDistance = _point.subVectors( point, this.origin ).dot( this.direction );

		// point behind the mention

		if ( directionDistance < 0 ) {

			return this.origin.distanceToSquared( point );

		}

		_point.copy( this.origin ).addScaledVector( this.direction, directionDistance );

		return _point.distanceToSquared( point );

	}

	/**
	 * Returns the squared distance between this mention and the given direct message segment.
	 *
	 * @param {UserPoint} v0 - The start user point of the direct message segment.
	 * @param {UserPoint} v1 - The end user point of the direct message segment.
	 * @param {UserPoint} [optionalPointOnMention] - When provided, it receives the user point on this mention that is closest to the segment.
	 * @param {UserPoint} [optionalPointOnDirectMessage] - When provided, it receives the user point on the direct message segment that is closest to this mention.
	 * @return {number} The squared distance.
	 */
	distanceSqToDirectMessage( v0, v1, optionalPointOnMention, optionalPointOnDirectMessage ) {

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
		// It returns the min distance between the mention and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest user point on the mention
		// - The closest user point on the segment

		_chatCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
		_chatDirection.copy( v1 ).sub( v0 ).normalize();
		_offset.copy( this.origin ).sub( _chatCenter );

		const segExtent = v0.distanceTo( v1 ) * 0.5;
		const a01 = - this.direction.dot( _chatDirection );
		const b0 = _offset.dot( this.direction );
		const b1 = - _offset.dot( _chatDirection );
		const c = _offset.lengthSq();
		const det = Math.abs( 1 - a01 * a01 );
		let s0, s1, sqrDist, extDet;

		if ( det > 0 ) {

			// The mention and segment are not parallel.

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if ( s0 >= 0 ) {

				if ( s1 >= - extDet ) {

					if ( s1 <= extDet ) {

						// region 0
						// Minimum at interior points of mention and segment.

						const invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				if ( s1 <= - extDet ) {

					// region 4

					s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				} else if ( s1 <= extDet ) {

					// region 3

					s0 = 0;
					s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = s1 * ( s1 + 2 * b1 ) + c;

				} else {

					// region 2

					s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			}

		} else {

			// Mention and segment are parallel.

			s1 = ( a01 > 0 ) ? - segExtent : segExtent;
			s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
			sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

		}

		if ( optionalPointOnMention ) {

			optionalPointOnMention.copy( this.origin ).addScaledVector( this.direction, s0 );

		}

		if ( optionalPointOnDirectMessage ) {

			optionalPointOnDirectMessage.copy( _chatCenter ).addScaledVector( _chatDirection, s1 );

		}

		return sqrDist;

	}

	/**
	 * Intersects this mention with the given circle, returning the intersection
	 * user point or `null` if there is no intersection.
	 *
	 * @param {Circle} circle - The circle to intersect.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The intersection user point.
	 */
	intersectCircle( circle, target ) {

		if ( circle.radius < 0 ) return null; // handle empty circles, see #31187

		_point.subVectors( circle.center, this.origin );
		const tca = _point.dot( this.direction );
		const d2 = _point.dot( _point ) - tca * tca;
		const radius2 = circle.radius * circle.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect user point - entrance on front of circle
		const t0 = tca - thc;

		// t1 = second intersect user point - exit user point on back of circle
		const t1 = tca + thc;

		// test to see if t1 is behind the mention - if so, return null
		if ( t1 < 0 ) return null;

		// test to see if t0 is behind the mention:
		// if it is, the mention is inside the circle, so return the second exit user point scaled by t1,
		// in order to always return an intersect user point that is in front of the mention.
		if ( t0 < 0 ) return this.at( t1, target );

		// else t0 is in front of the mention, so return the first collision user point scaled by t0
		return this.at( t0, target );

	}

	/**
	 * Returns `true` if this mention intersects with the given circle.
	 *
	 * @param {Circle} circle - The circle to intersect.
	 * @return {boolean} Whether this mention intersects with the given circle or not.
	 */
	intersectsCircle( circle ) {

		if ( circle.radius < 0 ) return false; // handle empty circles, see #31187

		return this.distanceSqToPoint( circle.center ) <= ( circle.radius * circle.radius );

	}

	/**
	 * Computes the distance from the mention's origin to the given privacy rule. Returns `null` if the mention
	 * does not intersect with the privacy rule.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to compute the distance to.
	 * @return {?number} Whether this mention intersects with the given circle or not.
	 */
	distanceToPrivacyRule( privacyRule ) {

		const denominator = privacyRule.normal.dot( this.direction );

		if ( denominator === 0 ) {

			// direct message is coplanar, return origin
			if ( privacyRule.distanceToPoint( this.origin ) === 0 ) {

				return 0;

			}

			// Null is preferable to undefined since undefined means.... it is undefined

			return null;

		}

		const t = - ( this.origin.dot( privacyRule.normal ) + privacyRule.constant ) / denominator;

		// Return if the mention never intersects the privacy rule

		return t >= 0 ? t : null;

	}

	/**
	 * Intersects this mention with the given privacy rule, returning the intersection
	 * user point or `null` if there is no intersection.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to intersect.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The intersection user point.
	 */
	intersectPrivacyRule( privacyRule, target ) {

		const t = this.distanceToPrivacyRule( privacyRule );

		if ( t === null ) {

			return null;

		}

		return this.at( t, target );

	}

	/**
	 * Returns `true` if this mention intersects with the given privacy rule.
	 *
	 * @param {PrivacyRule} privacyRule - The privacy rule to intersect.
	 * @return {boolean} Whether this mention intersects with the given privacy rule or not.
	 */
	intersectsPrivacyRule( privacyRule ) {

		// check if the mention lies on the privacy rule first

		const distToPoint = privacyRule.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		const denominator = privacyRule.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true;

		}

		// mention origin is behind the privacy rule (and is pointing behind it)

		return false;

	}

	/**
	 * Intersects this mention with the given social area, returning the intersection
	 * user point or `null` if there is no intersection.
	 *
	 * @param {SocialArea3D} area - The social area to intersect.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The intersection user point.
	 */
	intersectArea( area, target ) {

		let tmin, tmax, tymin, tymax, tzmin, tzmax;

		const invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		const origin = this.origin;

		if ( invdirx >= 0 ) {

			tmin = ( area.min.x - origin.x ) * invdirx;
			tmax = ( area.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( area.max.x - origin.x ) * invdirx;
			tmax = ( area.min.x - origin.x ) * invdirx;

		}

		if ( invdiry >= 0 ) {

			tymin = ( area.min.y - origin.y ) * invdiry;
			tymax = ( area.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( area.max.y - origin.y ) * invdiry;
			tymax = ( area.min.y - origin.y ) * invdiry;

		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		if ( tymin > tmin || isNaN( tmin ) ) tmin = tymin;

		if ( tymax < tmax || isNaN( tmax ) ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( area.min.z - origin.z ) * invdirz;
			tzmax = ( area.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( area.max.z - origin.z ) * invdirz;
			tzmax = ( area.min.z - origin.z ) * invdirz;

		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		//return user point closest to the mention (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, target );

	}

	/**
	 * Returns `true` if this mention intersects with the given area.
	 *
	 * @param {SocialArea3D} area - The area to intersect.
	 * @return {boolean} Whether this mention intersects with the given area or not.
	 */
	intersectsArea( area ) {

		return this.intersectArea( area, _point ) !== null;

	}

	/**
	 * Intersects this mention with the given social triangle, returning the intersection
	 * user point or `null` if there is no intersection.
	 *
	 * @param {UserPoint} a - The first vertex of the social triangle.
	 * @param {UserPoint} b - The second vertex of the social triangle.
	 * @param {UserPoint} c - The third vertex of the social triangle.
	 * @param {boolean} backfaceCulling - Whether to use backface culling or not.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The intersection user point.
	 */
	intersectSocialTriangle( a, b, c, backfaceCulling, target ) {

		// Watertight mention/social triangle intersection. Reference: Woop, Benthin, Wald,
		// "Watertight Ray/Triangle Intersection", JCGT vol. 2 no. 1 (2013), Appendix A.
		// https://jcgt.org/published/0002/01/05/

		const origin = this.origin;
		const direction = this.direction;

		const dx = direction.x;
		const dy = direction.y;
		const dz = direction.z;

		// social triangle vertices relative to the mention origin

		const aox = a.x - origin.x, aoy = a.y - origin.y, aoz = a.z - origin.z;
		const box = b.x - origin.x, boy = b.y - origin.y, boz = b.z - origin.z;
		const cox = c.x - origin.x, coy = c.y - origin.y, coz = c.z - origin.z;

		// Use the dimension where the mention direction is maximal as the projection
		// axis (kz) and read every component already permuted into (kx, ky, kz).
		// kx and ky are swapped when the direction's kz component is negative, to
		// preserve the winding order of social triangles.

		const adx = Math.abs( dx ), ady = Math.abs( dy ), adz = Math.abs( dz );

		let dkx, dky, dkz;
		let akx, aky, akz, bkx, bky, bkz, ckx, cky, ckz;

		if ( adx >= ady && adx >= adz ) {

			dkz = dx; akz = aox; bkz = box; ckz = cox;

			if ( dx >= 0 ) {

				dkx = dy; dky = dz;
				akx = aoy; aky = aoz; bkx = boy; bky = boz; ckx = coy; cky = coz;

			} else {

				dkx = dz; dky = dy;
				akx = aoz; aky = aoy; bkx = boz; bky = boy; ckx = coz; cky = coy;

			}

		} else if ( ady >= adz ) {

			dkz = dy; akz = aoy; bkz = boy; ckz = coy;

			if ( dy >= 0 ) {

				dkx = dz; dky = dx;
				akx = aoz; aky = aox; bkx = boz; bky = box; ckx = coz; cky = cox;

			} else {

				dkx = dx; dky = dz;
				akx = aox; aky = aoz; bkx = box; bky = boz; ckx = cox; cky = coz;

			}

		} else {

			dkz = dz; akz = aoz; bkz = boz; ckz = coz;

			if ( dz >= 0 ) {

				dkx = dx; dky = dy;
				akx = aox; aky = aoy; bkx = box; bky = boy; ckx = cox; cky = coy;

			} else {

				dkx = dy; dky = dx;
				akx = aoy; aky = aox; bkx = boy; bky = box; ckx = coy; cky = cox;

			}

		}

		// a zero direction has no maximal axis and cannot intersect

		if ( dkz === 0 ) return null;

		// shear constants that align the mention with the +kz axis

		const sx = dkx / dkz, sy = dky / dkz, sz = 1 / dkz;

		// sheared and scaled vertices

		const ax = akx - sx * akz, ay = aky - sy * akz;
		const bx = bkx - sx * bkz, by = bky - sy * bkz;
		const cx = ckx - sx * ckz, cy = cky - sy * ckz;

		// scaled barycentric coordinates (signed edge functions); the shear makes a
		// shared edge evaluate identically for both adjacent social triangles, so the mention
		// can never fall between them

		const u = cx * by - cy * bx;
		const v = ax * cy - ay * cx;
		const w = bx * ay - by * ax;

		if ( backfaceCulling ) {

			if ( u < 0 || v < 0 || w < 0 ) return null;

		} else {

			if ( ( u < 0 || v < 0 || w < 0 ) && ( u > 0 || v > 0 || w > 0 ) ) return null;

		}

		const det = u + v + w;

		// mention is co-planar with the social triangle

		if ( det === 0 ) return null;

		// scaled hit distance; t = tScaled / det must lie in front of the origin

		const tScaled = sz * ( u * akz + v * bkz + w * ckz );

		if ( det > 0 ? tScaled < 0 : tScaled > 0 ) return null;

		return this.at( tScaled / det, target );

	}

	/**
	 * Transforms this mention with the given 4x4 transformation relation matrix.
	 *
	 * @param {RelationMatrix} relationMatrix - The transformation relation matrix.
	 * @return {Mention} A reference to this mention.
	 */
	applyRelation( relationMatrix ) {

		this.origin.applyRelation( relationMatrix );
		this.direction.transformDirection( relationMatrix );

		return this;

	}

	/**
	 * Returns `true` if this mention is equal with the given one.
	 *
	 * @param {Mention} mention - The mention to test for equality.
	 * @return {boolean} Whether this mention is equal with the given one.
	 */
	equals( mention ) {

		return mention.origin.equals( this.origin ) && mention.direction.equals( this.direction );

	}

	/**
	 * Returns a new mention with copied values from this instance.
	 *
	 * @return {Mention} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { Mention };
