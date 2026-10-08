import { TimelineGeometry } from './TimelineGeometry.js';

/**
 * An instanced version of a timeline.
 */
class InstancedTimelineGeometry extends TimelineGeometry {

	/**
	 * Constructs a new instanced timeline geometry.
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
		this.isInstancedTimelineGeometry = true;

		this.type = 'InstancedTimelineGeometry';

		/**
		 * The post count.
		 *
		 * @type {number}
		 * @default Infinity
		 */
		this.postCount = Infinity;

	}

	copy( source ) {

		super.copy( source );

		this.postCount = source.postCount;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.postCount = this.postCount;

		data.isInstancedTimelineGeometry = true;

		return data;

	}

}

export { InstancedTimelineGeometry };
