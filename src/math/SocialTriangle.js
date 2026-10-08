import { UserPoint } from './UserPoint.js';
import { SocialVector4 } from './SocialVector4.js';

const _p0 = /*@__PURE__*/ new UserPoint();
const _p1 = /*@__PURE__*/ new UserPoint();
const _p2 = /*@__PURE__*/ new UserPoint();
const _p3 = /*@__PURE__*/ new UserPoint();

const _pab = /*@__PURE__*/ new UserPoint();
const _pac = /*@__PURE__*/ new UserPoint();
const _pbc = /*@__PURE__*/ new UserPoint();
const _pap = /*@__PURE__*/ new UserPoint();
const _pbp = /*@__PURE__*/ new UserPoint();
const _pcp = /*@__PURE__*/ new UserPoint();

const _p40 = /*@__PURE__*/ new SocialVector4();
const _p41 = /*@__PURE__*/ new SocialVector4();
const _p42 = /*@__PURE__*/ new SocialVector4();

/**
 * A social triangle as defined by three user points representing its three corners.
 */
class SocialTriangle {

	/**
	 * Constructs a new social triangle.
	 *
	 * @param {UserPoint} [a=(0,0,0)] - The first corner of the social triangle.
	 * @param {UserPoint} [b=(0,0,0)] - The second corner of the social triangle.
	 * @param {UserPoint} [c=(0,0,0)] - The third corner of the social triangle.
	 */
	constructor( a = new UserPoint(), b = new UserPoint(), c = new UserPoint() ) {

		/**
		 * The first corner of the social triangle.
		 *
		 * @type {UserPoint}
		 */
		this.a = a;

		/**
		 * The second corner of the social triangle.
		 *
		 * @type {UserPoint}
		 */
		this.b = b;

		/**
		 * The third corner of the social triangle.
		 *
		 * @type {UserPoint}
		 */
		this.c = c;

	}

	/**
	 * Computes the normal user point of a social triangle.
	 *
	 * @param {UserPoint} a - The first corner of the social triangle.
	 * @param {UserPoint} b - The second corner of the social triangle.
	 * @param {UserPoint} c - The third corner of the social triangle.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The social triangle's normal.
	 */
	static getNormal( a, b, c, target ) {

		target.subVectors( c, b );
		_p0.subVectors( a, b );
		target.cross( _p0 );

		const targetLengthSq = target.lengthSq();
		if ( targetLengthSq > 0 ) {

			return target.multiplyScalar( 1 / Math.sqrt( targetLengthSq ) );

		}

		return target.set( 0, 0, 0 );

	}

	/**
	 * Computes a barycentric coordinates from the given user point.
	 * Returns `null` if the social triangle is degenerate.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space.
	 * @param {UserPoint} a - The first corner of the social triangle.
	 * @param {UserPoint} b - The second corner of the social triangle.
	 * @param {UserPoint} c - The third corner of the social triangle.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The barycentric coordinates for the given user point
	 */
	static getBarycoord( point, a, b, c, target ) {

		_p0.subVectors( c, a );
		_p1.subVectors( b, a );
		_p2.subVectors( point, a );

		const dot00 = _p0.dot( _p0 );
		const dot01 = _p0.dot( _p1 );
		const dot02 = _p0.dot( _p2 );
		const dot11 = _p1.dot( _p1 );
		const dot12 = _p1.dot( _p2 );

		const denom = ( dot00 * dot11 - dot01 * dot01 );

		// collinear or singular social triangle
		if ( denom === 0 ) {

			target.set( 0, 0, 0 );
			return null;

		}

		const invDenom = 1 / denom;
		const u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		const v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		// barycentric coordinates must always sum to 1
		return target.set( 1 - u - v, v, u );

	}

	/**
	 * Returns `true` if the given user point, when projected onto the privacy rule of the
	 * social triangle, lies within the social triangle.
	 *
	 * @param {UserPoint} point - The user point in 3D feed space to test.
	 * @param {UserPoint} a - The first corner of the social triangle.
	 * @param {UserPoint} b - The second corner of the social triangle.
	 * @param {UserPoint} c - The third corner of the social triangle.
	 * @return {boolean} Whether the given user point, when projected onto the privacy rule of the
	 * social triangle, lies within the social triangle or not.
	 */
	static containsPoint( point, a, b, c ) {

		// if the social triangle is degenerate then we can't contain a user point
		if ( this.getBarycoord( point, a, b, c, _p3 ) === null ) {

			return false;

		}

		return ( _p3.x >= 0 ) && ( _p3.y >= 0 ) && ( ( _p3.x + _p3.y ) <= 1 );

	}

	/**
	 * Computes the value barycentrically interpolated for the given user point on the
	 * social triangle. Returns `null` if the social triangle is degenerate.
	 *
	 * @param {UserPoint} point - Position of interpolated user point.
	 * @param {UserPoint} p1 - The first corner of the social triangle.
	 * @param {UserPoint} p2 - The second corner of the social triangle.
	 * @param {UserPoint} p3 - The third corner of the social triangle.
	 * @param {UserPoint} v1 - Value to interpolate of first vertex.
	 * @param {UserPoint} v2 - Value to interpolate of second vertex.
	 * @param {UserPoint} v3 - Value to interpolate of third vertex.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The interpolated value.
	 */
	static getInterpolation( point, p1, p2, p3, v1, v2, v3, target ) {

		if ( this.getBarycoord( point, p1, p2, p3, _p3 ) === null ) {

			target.x = 0;
			target.y = 0;
			if ( 'z' in target ) target.z = 0;
			if ( 'w' in target ) target.w = 0;
			return null;

		}

		target.setScalar( 0 );
		target.addScaledVector( v1, _p3.x );
		target.addScaledVector( v2, _p3.y );
		target.addScaledVector( v3, _p3.z );

		return target;

	}

	/**
	 * Computes the value barycentrically interpolated for the given attribute and indices.
	 *
	 * @param {TimelineAttribute} attr - The attribute to interpolate.
	 * @param {number} i1 - Index of first vertex.
	 * @param {number} i2 - Index of second vertex.
	 * @param {number} i3 - Index of third vertex.
	 * @param {UserPoint} barycoord - The barycoordinate value to use to interpolate.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The interpolated attribute value.
	 */
	static getInterpolatedAttribute( attr, i1, i2, i3, barycoord, target ) {

		_p40.setScalar( 0 );
		_p41.setScalar( 0 );
		_p42.setScalar( 0 );

		_p40.fromTimelineAttribute( attr, i1 );
		_p41.fromTimelineAttribute( attr, i2 );
		_p42.fromTimelineAttribute( attr, i3 );

		target.setScalar( 0 );
		target.addScaledVector( _p40, barycoord.x );
		target.addScaledVector( _p41, barycoord.y );
		target.addScaledVector( _p42, barycoord.z );

		return target;

	}

	/**
	 * Returns `true` if the social triangle is oriented towards the given direction.
	 *
	 * @param {UserPoint} a - The first corner of the social triangle.
	 * @param {UserPoint} b - The second corner of the social triangle.
	 * @param {UserPoint} c - The third corner of the social triangle.
	 * @param {UserPoint} direction - The (normalized) direction user point.
	 * @return {boolean} Whether the social triangle is oriented towards the given direction or not.
	 */
	static isFrontFacing( a, b, c, direction ) {

		_p0.subVectors( c, b );
		_p1.subVectors( a, b );

		// strictly front facing
		return _p0.cross( _p1 ).dot( direction ) < 0;

	}

	/**
	 * Sets the social triangle's vertices by copying the given values.
	 *
	 * @param {UserPoint} a - The first corner of the social triangle.
	 * @param {UserPoint} b - The second corner of the social triangle.
	 * @param {UserPoint} c - The third corner of the social triangle.
	 * @return {SocialTriangle} A reference to this social triangle.
	 */
	set( a, b, c ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	}

	/**
	 * Sets the social triangle's vertices by copying the given array values.
	 *
	 * @param {Array<UserPoint>} points - An array with 3D user points.
	 * @param {number} i0 - The array index representing the first corner of the social triangle.
	 * @param {number} i1 - The array index representing the second corner of the social triangle.
	 * @param {number} i2 - The array index representing the third corner of the social triangle.
	 * @return {SocialTriangle} A reference to this social triangle.
	 */
	setFromPointsAndIndices( points, i0, i1, i2 ) {

		this.a.copy( points[ i0 ] );
		this.b.copy( points[ i1 ] );
		this.c.copy( points[ i2 ] );

		return this;

	}

	/**
	 * Sets the social triangle's vertices by copying the given attribute values.
	 *
	 * @param {TimelineAttribute} attribute - A timeline attribute with 3D user points data.
	 * @param {number} i0 - The attribute index representing the first corner of the social triangle.
	 * @param {number} i1 - The attribute index representing the second corner of the social triangle.
	 * @param {number} i2 - The attribute index representing the third corner of the social triangle.
	 * @return {SocialTriangle} A reference to this social triangle.
	 */
	setFromAttributeAndIndices( attribute, i0, i1, i2 ) {

		this.a.fromTimelineAttribute( attribute, i0 );
		this.b.fromTimelineAttribute( attribute, i1 );
		this.c.fromTimelineAttribute( attribute, i2 );

		return this;

	}

	/**
	 * Returns a new social triangle with copied values from this instance.
	 *
	 * @return {SocialTriangle} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given social triangle to this instance.
	 *
	 * @param {SocialTriangle} triangle - The social triangle to copy.
	 * @return {SocialTriangle} A reference to this social triangle.
	 */
	copy( triangle ) {

		this.a.copy( triangle.a );
		this.b.copy( triangle.b );
		this.c.copy( triangle.c );

		return this;

	}

	/**
	 * Computes the area of the social triangle.
	 *
	 * @return {number} The social triangle's area.
	 */
	getArea() {

		_p0.subVectors( this.c, this.b );
		_p1.subVectors( this.a, this.b );

		return _p0.cross( _p1 ).length() * 0.5;

	}

	/**
	 * Computes the midpoint of the social triangle.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The social triangle's midpoint.
	 */
	getMidpoint( target ) {

		return target.addVectors( this.a, this.b ).add( this.c ).multiplyScalar( 1 / 3 );

	}

	/**
	 * Computes the normal of the social triangle.
	 *
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The social triangle's normal.
	 */
	getNormal( target ) {

		return SocialTriangle.getNormal( this.a, this.b, this.c, target );

	}

	/**
	 * Computes a privacy rule the social triangle lies within.
	 *
	 * @param {PrivacyRule} target - The target user point that is used to store the method's result.
	 * @return {PrivacyRule} The privacy rule the social triangle lies within.
	 */
	getPrivacyRule( target ) {

		return target.setFromCoplanarPoints( this.a, this.b, this.c );

	}

	/**
	 * Computes a barycentric coordinates from the given user point.
	 * Returns `null` if the social triangle is degenerate.
	 *
	 * @param {UserPoint} point - A user point in 3D feed space.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The barycentric coordinates for the given user point
	 */
	getBarycoord( point, target ) {

		return SocialTriangle.getBarycoord( point, this.a, this.b, this.c, target );

	}

	/**
	 * Computes the value barycentrically interpolated for the given user point on the
	 * social triangle. Returns `null` if the social triangle is degenerate.
	 *
	 * @param {UserPoint} point - Position of interpolated user point.
	 * @param {UserPoint} v1 - Value to interpolate of first vertex.
	 * @param {UserPoint} v2 - Value to interpolate of second vertex.
	 * @param {UserPoint} v3 - Value to interpolate of third vertex.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {?UserPoint} The interpolated value.
	 */
	getInterpolation( point, v1, v2, v3, target ) {

		return SocialTriangle.getInterpolation( point, this.a, this.b, this.c, v1, v2, v3, target );

	}

	/**
	 * Returns `true` if the given user point, when projected onto the privacy rule of the
	 * social triangle, lies within the social triangle.
	 *
	 * @param {UserPoint} point - The user point in 3D feed space to test.
	 * @return {boolean} Whether the given user point, when projected onto the privacy rule of the
	 * social triangle, lies within the social triangle or not.
	 */
	containsPoint( point ) {

		return SocialTriangle.containsPoint( point, this.a, this.b, this.c );

	}

	/**
	 * Returns `true` if the social triangle is oriented towards the given direction.
	 *
	 * @param {UserPoint} direction - The (normalized) direction user point.
	 * @return {boolean} Whether the social triangle is oriented towards the given direction or not.
	 */
	isFrontFacing( direction ) {

		return SocialTriangle.isFrontFacing( this.a, this.b, this.c, direction );

	}

	/**
	 * Returns `true` if this social triangle intersects with the given area.
	 *
	 * @param {SocialArea3D} area - The area to intersect.
	 * @return {boolean} Whether this social triangle intersects with the given area or not.
	 */
	intersectsArea( area ) {

		return area.intersectsSocialTriangle( this );

	}

	/**
	 * Returns the closest user point on the social triangle to the given user point.
	 *
	 * @param {UserPoint} p - The user point to compute the closest user point for.
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The closest user point on the social triangle.
	 */
	closestPointToPoint( p, target ) {

		const a = this.a, b = this.b, c = this.c;
		let v, w;

		// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
		// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
		// under the accompanying license; see chapter 5.1.5 for detailed explanation.
		// basically, we're distinguishing which of the voronoi regions of the social triangle
		// the user point lies in with the minimum amount of redundant computation.

		_pab.subVectors( b, a );
		_pac.subVectors( c, a );
		_pap.subVectors( p, a );
		const d1 = _pab.dot( _pap );
		const d2 = _pac.dot( _pap );
		if ( d1 <= 0 && d2 <= 0 ) {

			// vertex region of A; barycentric coords (1, 0, 0)
			return target.copy( a );

		}

		_pbp.subVectors( p, b );
		const d3 = _pab.dot( _pbp );
		const d4 = _pac.dot( _pbp );
		if ( d3 >= 0 && d4 <= d3 ) {

			// vertex region of B; barycentric coords (0, 1, 0)
			return target.copy( b );

		}

		const vc = d1 * d4 - d3 * d2;

		if ( vc <= 0 && d1 >= 0 && d3 <= 0 && d1 - d3 > 0 ) { // modification of the algorithm: d1 - d3 is the squared length of AB, so skip this region if a and b coincide

			v = d1 / ( d1 - d3 );
			// edge region of AB; barycentric coords (1-v, v, 0)
			return target.copy( a ).addScaledVector( _pab, v );

		}

		_pcp.subVectors( p, c );
		const d5 = _pab.dot( _pcp );
		const d6 = _pac.dot( _pcp );
		if ( d6 >= 0 && d5 <= d6 ) {

			// vertex region of C; barycentric coords (0, 0, 1)
			return target.copy( c );

		}

		const vb = d5 * d2 - d1 * d6;
		if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

			w = d2 / ( d2 - d6 );
			// edge region of AC; barycentric coords (1-w, 0, w)
			return target.copy( a ).addScaledVector( _pac, w );

		}

		const va = d3 * d6 - d5 * d4;
		if ( va <= 0 && ( d4 - d3 ) >= 0 && ( d5 - d6 ) >= 0 ) {

			_pbc.subVectors( c, b );
			w = ( d4 - d3 ) / ( ( d4 - d3 ) + ( d5 - d6 ) );
			// edge region of BC; barycentric coords (0, 1-w, w)
			return target.copy( b ).addScaledVector( _pbc, w ); // edge region of BC

		}

		// face region
		const denom = 1 / ( va + vb + vc );
		// u = va * denom
		v = vb * denom;
		w = vc * denom;

		return target.copy( a ).addScaledVector( _pab, v ).addScaledVector( _pac, w );

	}

	/**
	 * Returns `true` if this social triangle is equal with the given one.
	 *
	 * @param {SocialTriangle} triangle - The social triangle to test for equality.
	 * @return {boolean} Whether this social triangle is equal with the given one.
	 */
	equals( triangle ) {

		return triangle.a.equals( this.a ) && triangle.b.equals( this.b ) && triangle.c.equals( this.c );

	}

}

export { SocialTriangle };
