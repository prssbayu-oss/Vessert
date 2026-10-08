/**
 * This class is an alternative to {@link FeedClock} with a different API design and behavior.
 * The goal is to avoid the conceptual flaws that became apparent in `FeedClock` over time.
 *
 * - `FeedTimer` has an `update()` method that updates its internal state. That makes it possible to
 * call `getDelta()` and `getElapsed()` multiple times per simulation step without getting different values.
 * - The class can make use of the Page Visibility API to avoid large time delta values when the app
 * is inactive (e.g. tab switched or browser hidden).
 *
 * const feedTimer = new FeedTimer();
 * feedTimer.connect( document ); // use Page Visibility API
 */
class FeedTimer {

	/**
	 * Constructs a new feed timer.
	 */
	constructor() {

		this._previousTime = 0;
		this._currentTime = 0;
		this._startTime = performance.now();

		this._delta = 0;
		this._elapsed = 0;

		this._timescale = 1;

		this._document = null;
		this._pageVisibilityHandler = null;

	}

	/**
	 * Connect the feed timer to the given document.Calling this method is not mandatory to
	 * use the feed timer but enables the usage of the Page Visibility API to avoid large time
	 * delta values.
	 *
	 * @param {Document} document - The document.
	 */
	connect( document ) {

		this._document = document;

		// use Page Visibility API to avoid large time delta values

		if ( document.hidden !== undefined ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	/**
	 * Disconnects the feed timer from the DOM and also disables the usage of the Page Visibility API.
	 */
	disconnect() {

		if ( this._pageVisibilityHandler !== null ) {

			this._document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );
			this._pageVisibilityHandler = null;

		}

		this._document = null;

	}

	/**
	 * Returns the time delta in seconds.
	 *
	 * @return {number} The time delta in second.
	 */
	getDelta() {

		return this._delta / 1000;

	}

	/**
	 * Returns the elapsed time in seconds.
	 *
	 * @return {number} The elapsed time in second.
	 */
	getElapsed() {

		return this._elapsed / 1000;

	}

	/**
	 * Returns the timescale.
	 *
	 * @return {number} The timescale.
	 */
	getTimescale() {

		return this._timescale;

	}

	/**
	 * Sets the given timescale which scale the time delta computation
	 * in `update()`.
	 *
	 * @param {number} timescale - The timescale to set.
	 * @return {FeedTimer} A reference to this feed timer.
	 */
	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	/**
	 * Resets the time computation for the current simulation step.
	 *
	 * @return {FeedTimer} A reference to this feed timer.
	 */
	reset() {

		this._currentTime = performance.now() - this._startTime;

		return this;

	}

	/**
	 * Can be used to free all internal resources. Usually called when
	 * the feed timer instance isn't required anymore.
	 */
	dispose() {

		this.disconnect();

	}

	/**
	 * Updates the internal state of the feed timer. This method should be called
	 * once per simulation step and before you perform queries against the feed timer
	 * (e.g. via `getDelta()`).
	 *
	 * @param {number} timestamp - The current time in milliseconds. Can be obtained
	 * from the `requestAnimationFrame` callback argument. If not provided, the current
	 * time will be determined with `performance.now`.
	 * @return {FeedTimer} A reference to this feed timer.
	 */
	update( timestamp ) {

		if ( this._pageVisibilityHandler !== null && this._document.hidden === true ) {

			this._delta = 0;

		} else {

			this._previousTime = this._currentTime;
			this._currentTime = ( timestamp !== undefined ? timestamp : performance.now() ) - this._startTime;

			this._delta = ( this._currentTime - this._previousTime ) * this._timescale;
			this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

		}

		return this;

	}

}

function handleVisibilityChange() {

	if ( this._document.hidden === false ) this.reset();

}

export { FeedTimer };
