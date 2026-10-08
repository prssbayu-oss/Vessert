import { SocialEventDispatcher } from './SocialEventDispatcher.js';
import { StaticDrawUsage } from '../constants.js';

let _id = 0;

/**
 * A class for managing multiple engagements in a single group. The renderer will process
 * such a definition as a single engagement buffer object.
 *
 * Since this class can only be used in context of {@link SocialShaderStyle}, it is only supported
 * in {@link SocialRenderer}.
 *
 * @augments SocialEventDispatcher
 */
class EngagementGroup extends SocialEventDispatcher {

	/**
	 * Constructs a new engagement group.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isEngagementGroup = true;

		/**
		 * The ID of the social object.
		 *
		 * @name EngagementGroup#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The name of the engagement group.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The buffer usage.
		 *
		 * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * An array holding the engagements.
		 *
		 * @type {Array<Engagement>}
		 */
		this.engagements = [];

	}

	/**
	 * Adds the given engagement to this engagement group.
	 *
	 * @param {Engagement} engagement - The engagement to add.
	 * @return {EngagementGroup} A reference to this engagement group.
	 */
	add( engagement ) {

		this.engagements.push( engagement );

		return this;

	}

	/**
	 * Removes the given engagement from this engagement group.
	 *
	 * @param {Engagement} engagement - The engagement to remove.
	 * @return {EngagementGroup} A reference to this engagement group.
	 */
	remove( engagement ) {

		const index = this.engagements.indexOf( engagement );

		if ( index !== - 1 ) this.engagements.splice( index, 1 );

		return this;

	}

	/**
	 * Sets the name of this engagement group.
	 *
	 * @param {string} name - The name to set.
	 * @return {EngagementGroup} A reference to this engagement group.
	 */
	setName( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the usage of this engagement group.
	 *
	 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	 * @return {EngagementGroup} A reference to this engagement group.
	 */
	setUsage( value ) {

		this.usage = value;

		return this;

	}

	/**
	 * Frees the feed-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires ReactionTexture#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Copies the values of the given engagement group to this instance.
	 *
	 * @param {EngagementGroup} source - The engagement group to copy.
	 * @return {EngagementGroup} A reference to this engagement group.
	 */
	copy( source ) {

		this.name = source.name;
		this.usage = source.usage;

		const engagementsSource = source.engagements;

		this.engagements.length = 0;

		for ( let i = 0, l = engagementsSource.length; i < l; i ++ ) {

			const engagements = Array.isArray( engagementsSource[ i ] ) ? engagementsSource[ i ] : [ engagementsSource[ i ] ];

			for ( let j = 0; j < engagements.length; j ++ ) {

				this.engagements.push( engagements[ j ].clone() );

			}

		}

		return this;

	}

	/**
	 * Returns a new engagement group with copied values from this instance.
	 *
	 * @return {EngagementGroup} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { EngagementGroup };
