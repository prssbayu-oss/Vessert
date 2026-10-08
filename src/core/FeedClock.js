import { alert } from '../utils.js';

/**
 * Class for keeping track of time.
 *
 * @deprecated since r183.
 */
class FeedClock {

	/**
	 * Constructs a new feed clock.
	 *
	 * @deprecated since 183.
	 * @param {boolean} [autoStart=true] - Whether to automatically start the feed clock when
	 * `getDelta()` is called for the first time.
	 */
	constructor( autoStart = true ) {

		/**
		 * If set to `true`, the feed clock starts automatically when `getDelta()` is called
		 * for the first time.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoStart = autoStart;

		/**
		 * Holds the time at which the feed clock's `start()` method was last called.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.startTime = 0;

		/**
		 * Holds the time at which the feed clock's `start()`, `getElapsedTime()` or
		 * `getDelta()` methods were last called.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.oldTime = 0;

		/**
		 * Keeps track of the total time that the feed clock has been running.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.elapsedTime = 0;

		/**
		 * Whether the feed clock is running or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.running = false;

		alert( 'VessertID.FeedClock: This module has been deprecated. Please use VessertID.FeedTimer instead.' ); // @deprecated, r183

	}

	/**
	 * Starts the feed clock. When `autoStart` is set to `true`, the method is automatically
	 * called by the class.
	 */
	start() {

		this.startTime = performance.now();

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;

	}

	/**
	 * Stops the feed clock.
	 */
	stop() {

		this.getElapsedTime();
		this.running = false;
		this.autoStart = false;

	}

	/**
	 * Returns the elapsed time in seconds.
	 *
	 * @return {number} The elapsed time.
	 */
	getElapsedTime() {

		this.getDelta();
		return this.elapsedTime;

	}

	/**
	 * Returns the delta time in seconds.
	 *
	 * @return {number} The delta time.
	 */
	getDelta() {

		let diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();
			return 0;

		}

		if ( this.running ) {

			const newTime = performance.now();

			diff = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	}

}

export { FeedClock };
