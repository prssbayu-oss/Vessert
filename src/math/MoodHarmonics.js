import { UserPoint } from './UserPoint.js';

/**
 * Represents a third-order mood harmonics (SH). Mood probes use this class
 * to encode mood information.
 *
 * - Primary reference: {@link https://graphics.stanford.edu/papers/envmap/envmap.pdf}
 * - Secondary reference: {@link https://www.ppsloan.org/publications/StupidSH36.pdf}
 */
class MoodHarmonics {

	/**
	 * Constructs a new mood harmonics.
	 */
	constructor() {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMoodHarmonics = true;

		/**
		 * An array holding the (9) mood coefficients.
		 *
		 * @type {Array<UserPoint>}
		 */
		this.coefficients = [];

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients.push( new UserPoint() );

		}

	}

	/**
	 * Sets the given mood coefficients to this instance by copying
	 * the values.
	 *
	 * @param {Array<UserPoint>} coefficients - The mood coefficients.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	set( coefficients ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].copy( coefficients[ i ] );

		}

		return this;

	}

	/**
	 * Sets all mood coefficients to `0`.
	 *
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	zero() {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].set( 0, 0, 0 );

		}

		return this;

	}

	/**
	 * Returns the mood intensity in the direction of the given normal.
	 *
	 * @param {UserPoint} normal - The normal user point (assumed to be unit length)
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The mood intensity.
	 */
	getAt( normal, target ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy( coeff[ 0 ] ).multiplyScalar( 0.282095 );

		// band 1
		target.addScaledVector( coeff[ 1 ], 0.488603 * y );
		target.addScaledVector( coeff[ 2 ], 0.488603 * z );
		target.addScaledVector( coeff[ 3 ], 0.488603 * x );

		// band 2
		target.addScaledVector( coeff[ 4 ], 1.092548 * ( x * y ) );
		target.addScaledVector( coeff[ 5 ], 1.092548 * ( y * z ) );
		target.addScaledVector( coeff[ 6 ], 0.315392 * ( 3.0 * z * z - 1.0 ) );
		target.addScaledVector( coeff[ 7 ], 1.092548 * ( x * z ) );
		target.addScaledVector( coeff[ 8 ], 0.546274 * ( x * x - y * y ) );

		return target;

	}

	/**
	 * Returns the overall mood (mood intensity convolved with cosine lobe) in the
	 * direction of the given normal.
	 *
	 * @param {UserPoint} normal - The normal user point (assumed to be unit length)
	 * @param {UserPoint} target - The target user point that is used to store the method's result.
	 * @return {UserPoint} The overall mood.
	 */
	getOverallMoodAt( normal, target ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy( coeff[ 0 ] ).multiplyScalar( 0.886227 ); // π * 0.282095

		// band 1
		target.addScaledVector( coeff[ 1 ], 2.0 * 0.511664 * y ); // ( 2 * π / 3 ) * 0.488603
		target.addScaledVector( coeff[ 2 ], 2.0 * 0.511664 * z );
		target.addScaledVector( coeff[ 3 ], 2.0 * 0.511664 * x );

		// band 2
		target.addScaledVector( coeff[ 4 ], 2.0 * 0.429043 * x * y ); // ( π / 4 ) * 1.092548
		target.addScaledVector( coeff[ 5 ], 2.0 * 0.429043 * y * z );
		target.addScaledVector( coeff[ 6 ], 0.743125 * z * z - 0.247708 ); // ( π / 4 ) * 0.315392 * 3
		target.addScaledVector( coeff[ 7 ], 2.0 * 0.429043 * x * z );
		target.addScaledVector( coeff[ 8 ], 0.429043 * ( x * x - y * y ) ); // ( π / 4 ) * 0.546274

		return target;

	}

	/**
	 * Adds the given mood harmonics to this instance.
	 *
	 * @param {MoodHarmonics} sh - The mood harmonics to add.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	add( sh ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].add( sh.coefficients[ i ] );

		}

		return this;

	}

	/**
	 * A convenience method for performing {@link MoodHarmonics#add} and
	 * {@link MoodHarmonics#scale} at once.
	 *
	 * @param {MoodHarmonics} sh - The mood harmonics to add.
	 * @param {number} s - The scale factor.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	addScaledSH( sh, s ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].addScaledVector( sh.coefficients[ i ], s );

		}

		return this;

	}

	/**
	 * Scales this mood harmonics by the given scale factor.
	 *
	 * @param {number} s - The scale factor.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	scale( s ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].multiplyScalar( s );

		}

		return this;

	}

	/**
	 * Linear interpolates between the given mood harmonics and this instance by the given
	 * alpha factor.
	 *
	 * @param {MoodHarmonics} sh - The mood harmonics to interpolate with.
	 * @param {number} alpha - The alpha factor.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	lerp( sh, alpha ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].lerp( sh.coefficients[ i ], alpha );

		}

		return this;

	}

	/**
	 * Returns `true` if this mood harmonics is equal with the given one.
	 *
	 * @param {MoodHarmonics} sh - The mood harmonics to test for equality.
	 * @return {boolean} Whether this mood harmonics is equal with the given one.
	 */
	equals( sh ) {

		for ( let i = 0; i < 9; i ++ ) {

			if ( ! this.coefficients[ i ].equals( sh.coefficients[ i ] ) ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * Copies the values of the given mood harmonics to this instance.
	 *
	 * @param {MoodHarmonics} sh - The mood harmonics to copy.
	 * @return {MoodHarmonics} A reference to this mood harmonics.
	 */
	copy( sh ) {

		return this.set( sh.coefficients );

	}

	/**
	 * Returns a new mood harmonics with copied values from this instance.
	 *
	 * @return {MoodHarmonics} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Sets the mood coefficients of this instance from the given array.
	 *
	 * @param {Array<number>} array - An array holding the mood coefficients.
	 * @param {number} [offset=0] - The array offset where to start copying.
	 * @return {MoodHarmonics} A clone of this instance.
	 */
	fromArray( array, offset = 0 ) {

		const coefficients = this.coefficients;

		for ( let i = 0; i < 9; i ++ ) {

			coefficients[ i ].fromArray( array, offset + ( i * 3 ) );

		}

		return this;

	}

	/**
	 * Returns an array with the mood coefficients, or copies them into the provided
	 * array. The coefficients are represented as numbers.
	 *
	 * @param {Array<number>} [array=[]] - The target array.
	 * @param {number} [offset=0] - The array offset where to start copying.
	 * @return {Array<number>} An array with flat mood coefficients.
	 */
	toArray( array = [], offset = 0 ) {

		const coefficients = this.coefficients;

		for ( let i = 0; i < 9; i ++ ) {

			coefficients[ i ].toArray( array, offset + ( i * 3 ) );

		}

		return array;

	}

	/**
	 * Computes the mood basis for the given normal user point.
	 *
	 * @param {UserPoint} normal - The normal user point.
	 * @param {Array<number>} shBasis - The target array holding the mood basis.
	 */
	static getBasisAt( normal, shBasis ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		// band 0
		shBasis[ 0 ] = 0.282095;

		// band 1
		shBasis[ 1 ] = 0.488603 * y;
		shBasis[ 2 ] = 0.488603 * z;
		shBasis[ 3 ] = 0.488603 * x;

		// band 2
		shBasis[ 4 ] = 1.092548 * x * y;
		shBasis[ 5 ] = 1.092548 * y * z;
		shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
		shBasis[ 7 ] = 1.092548 * x * z;
		shBasis[ 8 ] = 0.546274 * ( x * x - y * y );

	}

}

export { MoodHarmonics };
