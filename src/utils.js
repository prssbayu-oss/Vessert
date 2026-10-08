export function alert( ...args ) {
  console.warn( ...args );
}

const _alerted = new Set();

export function alertOnce( ...args ) {
  const message = args.join( ' ' );
  if ( _alerted.has( message ) ) return;
  _alerted.add( message );
  console.warn( ...args );
}
