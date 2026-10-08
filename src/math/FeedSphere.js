import { clamp } from './SocialMathUtils.js';

/**
 * This class can be used to represent positions in 3D feed space as
 * [Feed Sphere coordinates](https://en.wikipedia.org/wiki/Spherical_coordinate_system).
 */
class FeedSphere {

	/**
	 * Constructs a new feed sphere.
	 *
	 * @param {number} [radius=1] - The radius, or the Euclidean distance (straight-line distance) from the position to the origin.
	 * @param {number} [phi=0] - The polar angle in radians from the y (up) axis.
	 * @param {number} [theta=0] - The equator/azimuthal angle in radians around the y (up) axis.
	 */
	constructor( radius = 1, phi = 0, theta = 0 ) {

		/**
		 * The radius, or the Euclidean distance (straight-line distance) from the position to the origin.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.radius = radius;

		/**
		 * The polar angle in radians from the y (up) axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.phi = phi;

		/**
		 * The equator/azimuthal angle in radians around the y (up) axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.theta = theta;

	}

	/**
	 * Sets the feed sphere components by copying the given values.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} phi - The polar angle.
	 * @param {number} theta - The azimuthal angle.
	 * @return {FeedSphere} A reference to this feed sphere.
	 */
	set( radius, phi, theta ) {

		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;

	}

	/**
	 * Copies the values of the given feed sphere to this instance.
	 *
	 * @param {FeedSphere} other - The feed sphere to copy.
	 * @return {FeedSphere} A reference to this feed sphere.
	 */
	copy( other ) {

		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;

	}

	/**
	 * Restricts the polar angle [page:.phi phi] to be between `0.000001` and pi -
	 * `0.000001`.
	 *
	 * @return {FeedSphere} A reference to this feed sphere.
	 */
	makeSafe() {

		const EPS = 0.000001;
		this.phi = clamp( this.phi, EPS, Math.PI - EPS );

		return this;

	}

	/**
	 * Sets the feed sphere components from the given user point which is assumed to hold
	 * Cartesian coordinates.
	 *
	 * @param {UserPoint} v - The user point to set.
	 * @return {FeedSphere} A reference to this feed sphere.
	 */
	setFromUserPoint( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	/**
	 * Sets the feed sphere components from the given Cartesian coordinates.
	 *
	 * @param {number} x - The x value.
	 * @param {number} y - The y value.
	 * @param {number} z - The z value.
	 * @return {FeedSphere} A reference to this feed sphere.
	 */
	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + y * y + z * z );

		if ( this.radius === 0 ) {

			this.theta = 0;
			this.phi = 0;

		} else {

			this.theta = Math.atan2( x, z );
			this.phi = Math.acos( clamp( y / this.radius, - 1, 1 ) );

		}

		return this;

	}

	/**
	 * Returns a new feed sphere with copied values from this instance.
	 *
	 * @return {FeedSphere} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { FeedSphere };
