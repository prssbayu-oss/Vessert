/**
 * VessertID — Utilities
 * Internal helper functions used throughout the library.
 */

// ------------------------------------------------------------
// Console Alerts (padanan warn / error / log)
// ------------------------------------------------------------

/**
 * Logs an alert to the console.
 *
 * @param {...any} args - The alert arguments.
 */
function alert( ...args ) {

	console.warn( ...args );

}

// cache of already-alerted messages (for alertOnce)
const _alertedMessages = new Set();

/**
 * Logs an alert to the console only once per unique message.
 *
 * @param {...any} args - The alert arguments.
 */
function alertOnce( ...args ) {

	const message = args.join( ' ' );

	if ( _alertedMessages.has( message ) === false ) {

		_alertedMessages.add( message );
		console.warn( ...args );

	}

}

/**
 * Logs an informational message to the console.
 *
 * @param {...any} args - The log arguments.
 */
function log( ...args ) {

	console.log( ...args );

}

/**
 * Logs an error to the console.
 *
 * @param {...any} args - The error arguments.
 */
function error( ...args ) {

	console.error( ...args );

}

// ------------------------------------------------------------
// DOM Helpers
// ------------------------------------------------------------

/**
 * Creates a new element with the given tag name using the SVG
 * namespace-aware document API.
 *
 * @param {string} name - The tag name.
 * @return {HTMLElement} The created element.
 */
function createElementNS( name ) {

	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}

// ------------------------------------------------------------
// TypedArray / Buffer Helpers
// ------------------------------------------------------------

/**
 * Returns `true` if the given array requires a `Uint32Array`
 * to index all of its elements.
 *
 * @param {Array<number>|TypedArray} array - The array to check.
 * @return {boolean} Whether the array needs a `Uint32Array` or not.
 */
function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #8874

	}

	return false;

}

// ------------------------------------------------------------
// Math / Array Helpers
// ------------------------------------------------------------

/**
 * Returns the smallest power of two greater than or equal to the given value.
 *
 * @param {number} value - The input value.
 * @return {number} The next power of two.
 */
function ceilPowerOfTwo( value ) {

	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

}

/**
 * Returns the largest power of two less than or equal to the given value.
 *
 * @param {number} value - The input value.
 * @return {number} The previous power of two.
 */
function floorPowerOfTwo( value ) {

	return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

}

// ------------------------------------------------------------
// Promise / Async Helpers
// ------------------------------------------------------------

/**
 * Creates a debounced version of the given function that only
 * executes after the specified idle delay.
 *
 * @param {Function} callback - The function to debounce.
 * @return {Function} The debounced function.
 */
function debounce( callback ) {

	let timeout = null;

	return function () {

		clearTimeout( timeout );

		timeout = setTimeout( () => {

			callback.call( this, ...arguments );

		}, 300 );

	};

}

// ------------------------------------------------------------
// Exports
// ------------------------------------------------------------

export {
	alert,
	alertOnce,
	log,
	error,
	createElementNS,
	arrayNeedsUint32,
	ceilPowerOfTwo,
	floorPowerOfTwo,
	debounce
};
