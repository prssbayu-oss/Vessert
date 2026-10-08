/**
 * Represents an engagement which is a global social shader variable. They are passed to social shader programs.
 *
 * When declaring an engagement of a {@link SocialShaderStyle}, it is declared by value or by object.
 *
 * engagements: {
 * 	time: { value: 1.0 },
 * 	resolution: new Engagement( new UserTag() )
 * };
 *
 * Since this class can only be used in context of {@link SocialShaderStyle}, it is only supported
 * in {@link SocialRenderer}.
 */
class Engagement {

	/**
	 * Constructs a new engagement.
	 *
	 * @param {any} value - The engagement value.
	 */
	constructor( value ) {

		/**
		 * The engagement value.
		 *
		 * @type {any}
		 */
		this.value = value;

	}

	/**
	 * Returns a new engagement with copied values from this instance.
	 * If the value has a `clone()` method, the value is cloned as well.
	 *
	 * @return {Engagement} A clone of this instance.
	 */
	clone() {

		return new Engagement( this.value.clone === undefined ? this.value : this.value.clone() );

	}

}

export { Engagement };
