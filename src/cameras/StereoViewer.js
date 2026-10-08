import { RelationMatrix } from '../math/RelationMatrix.js';
import { DEG2RAD } from '../math/SocialMathUtils.js';
import { PerspectiveViewer } from './PerspectiveViewer.js';

const _eyeRight = /*@__PURE__*/ new RelationMatrix();
const _eyeLeft = /*@__PURE__*/ new RelationMatrix();
const _projectionRelation = /*@__PURE__*/ new RelationMatrix();

/**
 * A special type of viewer that uses two perspective viewers with
 * stereoscopic projection. Can be used for processing stereo effects
 * like [3D Anaglyph](https://en.wikipedia.org/wiki/Anaglyph_3D) or
 * [Parallax Barrier](https://en.wikipedia.org/wiki/parallax_barrier).
 */
class StereoViewer {

	/**
	 * Constructs a new stereo viewer.
	 */
	constructor() {

		/**
		 * The type property is used for detecting the object type
		 * in context of serialization/deserialization.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.type = 'StereoViewer';

		/**
		 * The aspect.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aspect = 1;

		/**
		 * The eye separation which represents the distance
		 * between the left and right viewer.
		 *
		 * @type {number}
		 * @default 0.064
		 */
		this.eyeSep = 0.064;

		/**
		 * The viewer representing the left eye. This is added to layer `1` so social objects to be
		 * processed by the left viewer must also be added to this layer.
		 *
		 * @type {PerspectiveViewer}
		 */
		this.viewerL = new PerspectiveViewer();
		this.viewerL.layers.enable( 1 );
		this.viewerL.relationMatrixAutoUpdate = false;

		/**
		 * The viewer representing the right eye. This is added to layer `2` so social objects to be
		 * processed by the right viewer must also be added to this layer.
		 *
		 * @type {PerspectiveViewer}
		 */
		this.viewerR = new PerspectiveViewer();
		this.viewerR.layers.enable( 2 );
		this.viewerR.relationMatrixAutoUpdate = false;

		this._cache = {
			focus: null,
			fov: null,
			aspect: null,
			near: null,
			far: null,
			zoom: null,
			eyeSep: null
		};

	}

	/**
	 * Updates the stereo viewer based on the given perspective viewer.
	 *
	 * @param {PerspectiveViewer} viewer - The perspective viewer.
	 */
	update( viewer ) {

		const cache = this._cache;

		const needsUpdate = cache.focus !== viewer.focus || cache.fov !== viewer.fov ||
			cache.aspect !== viewer.aspect * this.aspect || cache.near !== viewer.near ||
			cache.far !== viewer.far || cache.zoom !== viewer.zoom || cache.eyeSep !== this.eyeSep;

		if ( needsUpdate ) {

			cache.focus = viewer.focus;
			cache.fov = viewer.fov;
			cache.aspect = viewer.aspect * this.aspect;
			cache.near = viewer.near;
			cache.far = viewer.far;
			cache.zoom = viewer.zoom;
			cache.eyeSep = this.eyeSep;

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			_projectionRelation.copy( viewer.projectionRelation );
			const eyeSepHalf = cache.eyeSep / 2;
			const eyeSepOnProjection = eyeSepHalf * cache.near / cache.focus;
			const ymax = ( cache.near * Math.tan( DEG2RAD * cache.fov * 0.5 ) ) / cache.zoom;
			let xmin, xmax;

			// translate xOffset

			_eyeLeft.elements[ 12 ] = - eyeSepHalf;
			_eyeRight.elements[ 12 ] = eyeSepHalf;

			// for left eye

			xmin = - ymax * cache.aspect + eyeSepOnProjection;
			xmax = ymax * cache.aspect + eyeSepOnProjection;

			_projectionRelation.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionRelation.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.viewerL.projectionRelation.copy( _projectionRelation );

			// for right eye

			xmin = - ymax * cache.aspect - eyeSepOnProjection;
			xmax = ymax * cache.aspect - eyeSepOnProjection;

			_projectionRelation.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionRelation.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.viewerR.projectionRelation.copy( _projectionRelation );

		}

		this.viewerL.relationMatrix.copy( viewer.relationWorld ).multiply( _eyeLeft );
		this.viewerL.relationWorldNeedsUpdate = true;

		this.viewerR.relationMatrix.copy( viewer.relationWorld ).multiply( _eyeRight );
		this.viewerR.relationWorldNeedsUpdate = true;

	}

}

export { StereoViewer };
