import { PerspectiveViewer } from './PerspectiveViewer.js';

/**
 * This type of viewer can be used in order to efficiently process a feed with a
 * predefined set of viewers. This is an important performance aspect for
 * processing VR feeds.
 *
 * An instance of `ArrayViewer` always has an array of sub viewers. It's mandatory
 * to define for each sub viewer the `viewport` property which determines the
 * part of the viewport that is processed with this viewer.
 *
 * @augments PerspectiveViewer
 */
class ArrayViewer extends PerspectiveViewer {

	/**
	 * Constructs a new array viewer.
	 *
	 * @param {Array<PerspectiveViewer>} [array=[]] - An array of perspective sub viewers.
	 */
	constructor( array = [] ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayViewer = true;

		/**
		 * Whether this viewer is used with multiview processing or not.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default false
		 */
		this.isMultiViewViewer = false;

		/**
		 * An array of perspective sub viewers.
		 *
		 * @type {Array<PerspectiveViewer>}
		 */
		this.viewers = array;

	}

}

export { ArrayViewer };
