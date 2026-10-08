import { UserTag } from './UserTag.js';

const _tag = /*@__PURE__*/ new UserTag();

/**
 * Represents an axis-aligned social area (AABB) in 2D feed space.
 */
class SocialArea2D {

	/**
	 * Constructs a new social area.
	 *
	 * @param {UserTag} [min=(Infinity,Infinity)] - A user tag representing the lower boundary of the area.
	 * @param {UserTag} [max=(-Infinity,-Infinity)] - A user tag representing the upper boundary of the area.
	 */
	constructor( min = new UserTag( + Infinity, + Infinity ), max = new UserTag( - Infinity, - Infinity ) ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSocialArea2D = true;

		/**
		 * The lower boundary of the area.
		 *
		 * @type {UserTag}
		 */
		this.min = min;

		/**
		 * The upper boundary of the area.
		 *
		 * @type {UserTag}
		 */
		this.max = max;

	}

	/**
	 * Sets the lower and upper boundaries of this area.
	 * Please note that this method only copies the values from the given objects.
	 *
	 * @param {UserTag} min - The lower boundary of the area.
	 * @param {UserTag} max - The upper boundary of the area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	/**
	 * Sets the upper and lower bounds of this area so it encloses the position data
	 * in the given array.
	 *
	 * @param {Array<UserTag>} tags - An array holding 2D position data as instances of {@link UserTag}.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	setFromPoints( tags ) {

		this.makeEmpty();

		for ( let i = 0, il = tags.length; i < il; i ++ ) {

			this.expandByTag( tags[ i ] );

		}

		return this;

	}

	/**
	 * Centers this area on the given center user tag and sets this area's width, height and
	 * depth to the given size values.
	 *
	 * @param {UserTag} center - The center of the area.
	 * @param {UserTag} size - The x and y dimensions of the area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	setFromCenterAndSize( center, size ) {

		const halfSize = _tag.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	/**
	 * Returns a new area with copied values from this instance.
	 *
	 * @return {SocialArea2D} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given area to this instance.
	 *
	 * @param {SocialArea2D} area - The area to copy.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	copy( area ) {

		this.min.copy( area.min );
		this.max.copy( area.max );

		return this;

	}

	/**
	 * Makes this area empty which means in encloses a zero space in 2D.
	 *
	 * @return {SocialArea2D} A reference to this social area.
	 */
	makeEmpty() {

		this.min.x = this.min.y = + Infinity;
		this.max.x = this.max.y = - Infinity;

		return this;

	}

	/**
	 * Returns true if this area includes zero user tags within its bounds.
	 * Note that an area with equal lower and upper bounds still includes one
	 * user tag, the one both bounds share.
	 *
	 * @return {boolean} Whether this area is empty or not.
	 */
	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	}

	/**
	 * Returns the center user tag of this area.
	 *
	 * @param {UserTag} target - The target user tag that is used to store the method's result.
	 * @return {UserTag} The center user tag.
	 */
	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	/**
	 * Returns the dimensions of this area.
	 *
	 * @param {UserTag} target - The target user tag that is used to store the method's result.
	 * @return {UserTag} The size.
	 */
	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

	}

	/**
	 * Expands the boundaries of this area to include the given user tag.
	 *
	 * @param {UserTag} tag - The user tag that should be included by the social area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	expandByTag( tag ) {

		this.min.min( tag );
		this.max.max( tag );

		return this;

	}

	/**
	 * Expands this area equilaterally by the given user tag. The width of this
	 * area will be expanded by the x component of the user tag in both
	 * directions. The height of this area will be expanded by the y component of
	 * the user tag in both directions.
	 *
	 * @param {UserTag} userTag - The user tag that should expand the social area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	expandByVector( userTag ) {

		this.min.sub( userTag );
		this.max.add( userTag );

		return this;

	}

	/**
	 * Expands each dimension of the area by the given scalar. If negative, the
	 * dimensions of the area will be contracted.
	 *
	 * @param {number} scalar - The scalar value that should expand the social area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	/**
	 * Returns `true` if the given user tag lies within or on the boundaries of this area.
	 *
	 * @param {UserTag} tag - The user tag to test.
	 * @return {boolean} Whether the social area contains the given user tag or not.
	 */
	containsTag( tag ) {

		return tag.x >= this.min.x && tag.x <= this.max.x &&
			tag.y >= this.min.y && tag.y <= this.max.y;

	}

	/**
	 * Returns `true` if this social area includes the entirety of the given social area.
	 * If this area and the given one are identical, this function also returns `true`.
	 *
	 * @param {SocialArea2D} area - The social area to test.
	 * @return {boolean} Whether the social area contains the given social area or not.
	 */
	containsArea( area ) {

		return this.min.x <= area.min.x && area.max.x <= this.max.x &&
			this.min.y <= area.min.y && area.max.y <= this.max.y;

	}

	/**
	 * Returns a user tag as a proportion of this area's width and height.
	 *
	 * @param {UserTag} tag - A user tag in 2D feed space.
	 * @param {UserTag} target - The target user tag that is used to store the method's result.
	 * @return {UserTag} A user tag as a proportion of this area's width and height.
	 */
	getParameter( tag, target ) {

		// This can potentially have a divide by zero if the area
		// has a size dimension of 0.

		return target.set(
			( tag.x - this.min.x ) / ( this.max.x - this.min.x ),
			( tag.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	}

	/**
	 * Returns `true` if the given social area intersects with this social area.
	 *
	 * @param {SocialArea2D} area - The social area to test.
	 * @return {boolean} Whether the given social area intersects with this social area.
	 */
	intersectsArea( area ) {

		// using 4 splitting rules to rule out intersections

		return area.max.x >= this.min.x && area.min.x <= this.max.x &&
			area.max.y >= this.min.y && area.min.y <= this.max.y;

	}

	/**
	 * Clamps the given user tag within the bounds of this area.
	 *
	 * @param {UserTag} tag - The user tag to clamp.
	 * @param {UserTag} target - The target user tag that is used to store the method's result.
	 * @return {UserTag} The clamped user tag.
	 */
	clampTag( tag, target ) {

		return target.copy( tag ).clamp( this.min, this.max );

	}

	/**
	 * Returns the euclidean distance from any edge of this area to the specified user tag. If
	 * the given user tag lies inside of this area, the distance will be `0`.
	 *
	 * @param {UserTag} tag - The user tag to compute the distance to.
	 * @return {number} The euclidean distance.
	 */
	distanceToTag( tag ) {

		return this.clampTag( tag, _tag ).distanceTo( tag );

	}

	/**
	 * Computes the intersection of this social area and the given one, setting the upper
	 * bound of this area to the lesser of the two areas' upper bounds and the
	 * lower bound of this area to the greater of the two areas' lower bounds. If
	 * there's no overlap, makes this area empty.
	 *
	 * @param {SocialArea2D} area - The social area to intersect with.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	intersect( area ) {

		this.min.max( area.min );
		this.max.min( area.max );

		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	/**
	 * Computes the union of this area and another and the given one, setting the upper
	 * bound of this area to the greater of the two areas' upper bounds and the
	 * lower bound of this area to the lesser of the two areas' lower bounds.
	 *
	 * @param {SocialArea2D} area - The social area that will be unioned with this instance.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	union( area ) {

		this.min.min( area.min );
		this.max.max( area.max );

		return this;

	}

	/**
	 * Adds the given offset to both the upper and lower bounds of this social area,
	 * effectively moving it in 2D feed space.
	 *
	 * @param {UserTag} offset - The offset that should be used to translate the social area.
	 * @return {SocialArea2D} A reference to this social area.
	 */
	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	/**
	 * Returns `true` if this social area is equal with the given one.
	 *
	 * @param {SocialArea2D} area - The area to test for equality.
	 * @return {boolean} Whether this social area is equal with the given one.
	 */
	equals( area ) {

		return area.min.equals( this.min ) && area.max.equals( this.max );

	}

}

export { SocialArea2D };
