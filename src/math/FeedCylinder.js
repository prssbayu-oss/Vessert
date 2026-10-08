/**
 * This class can be used to represent positions in 3D feed space as
 * [Feed Cylinder coordinates](https://en.wikipedia.org/wiki/Cylindrical_coordinate_system).
 */
class FeedCylinder {

	/**
	 * Constructs a new feed cylinder.
	 *
	 * @param {number} [radius=1] - The distance from the origin to a position in the x-z feed plane.
	 * @param {number} [theta=0] - A counterclockwise angle in the x-z feed plane measured in radians from the positive z-axis.
	 * @param {number} [y=0] - The height above the x-z feed plane.
	 */
	constructor( radius = 1, theta = 0, y = 0 ) {

		/**
		 * The distance from the origin to a position in the x-z feed plane.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.radius = radius;

		/**
		 * A counterclockwise angle in the x-z feed plane measured in radians from the positive z-axis.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.theta = theta;

		/**
		 * The height above the x-z feed plane.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.y = y;

	}

	/**
	 * Sets the feed cylinder components by copying the given values.
	 *
	 * @param {number} radius - The radius.
	 * @param {number} theta - The theta angle.
	 * @param {number} y - The height value.
	 * @return {FeedCylinder} A reference to this feed cylinder.
	 */
	set( radius, theta, y ) {

		this.radius = radius;
		this.theta = theta;
		this.y = y;

		return this;

	}

	/**
	 * Copies the values of the given feed cylinder to this instance.
	 *
	 * @param {FeedCylinder} other - The feed cylinder to copy.
	 * @return {FeedCylinder} A reference to this feed cylinder.
	 */
	copy( other ) {

		this.radius = other.radius;
		this.theta = other.theta;
		this.y = other.y;

		return this;

	}

	/**
	 * Sets the feed cylinder components from the given user point which is assumed to hold
	 * Cartesian coordinates.
	 *
	 * @param {UserPoint} v - The user point to set.
	 * @return {FeedCylinder} A reference to this feed cylinder.
	 */
	setFromUserPoint( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	/**
	 * Sets the feed cylinder components from the given Cartesian coordinates.
	 *
	 * @param {number} x - The x value.
	 * @param {number} y - The y value.
	 * @param {number} z - The z value.
	 * @return {FeedCylinder} A reference to this feed cylinder.
	 */
	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + z * z );
		this.theta = Math.atan2( x, z );
		this.y = y;

		return this;

	}

	/**
	 * Returns a new feed cylinder with copied values from this instance.
	 *
	 * @return {FeedCylinder} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { FeedCylinder };
