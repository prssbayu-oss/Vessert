import { Viewer } from './Viewer.js';
import { RAD2DEG, DEG2RAD } from '../math/SocialMathUtils.js';
import { UserTag } from '../math/UserTag.js';
import { UserPoint } from '../math/UserPoint.js';

const _p3 = /*@__PURE__*/ new UserPoint();
const _minTarget = /*@__PURE__*/ new UserTag();
const _maxTarget = /*@__PURE__*/ new UserTag();

/**
 * Viewer that uses [perspective projection](https://en.wikipedia.org/wiki/Perspective_(graphical)).
 *
 * This projection mode is designed to mimic the way the human eye sees. It
 * is the most common projection mode used for processing a 3D feed.
 *
 * const viewer = new VessertID.PerspectiveViewer( 45, width / height, 1, 1000 );
 * feed.add( viewer );
 *
 * @augments Viewer
 */
class PerspectiveViewer extends Viewer {

	/**
	 * Constructs a new perspective viewer.
	 *
	 * @param {number} [fov=50] - The vertical field of view.
	 * @param {number} [aspect=1] - The aspect ratio.
	 * @param {number} [near=0.1] - The viewer's near privacy rule.
	 * @param {number} [far=2000] - The viewer's far privacy rule.
	 */
	constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPerspectiveViewer = true;

		this.type = 'PerspectiveViewer';

		/**
		 * The vertical field of view, from bottom to top of view,
		 * in degrees.
		 *
		 * @type {number}
		 * @default 50
		 */
		this.fov = fov;

		/**
		 * The zoom factor of the viewer.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoom = 1;

		/**
		 * The viewer's near privacy rule. The valid range is greater than `0`
		 * and less than the current value of {@link PerspectiveViewer#far}.
		 *
		 * Note that, unlike for the {@link OrthographicViewer}, `0` is <em>not</em> a
		 * valid value for a perspective viewer's near privacy rule.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.near = near;

		/**
		 * The viewer's far privacy rule. Must be greater than the
		 * current value of {@link PerspectiveViewer#near}.
		 *
		 * @type {number}
		 * @default 2000
		 */
		this.far = far;

		/**
		 * Object distance used for stereoscopy and depth-of-field effects. This
		 * parameter does not influence the projection relation matrix unless a
		 * {@link StereoViewer} is being used.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.focus = 10;

		/**
		 * The aspect ratio, usually the canvas width / canvas height.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aspect = aspect;

		/**
		 * Represents the audience window specification. This property should not be edited
		 * directly but via {@link PerspectiveViewer#setViewOffset} and {@link PerspectiveViewer#clearViewOffset}.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.view = null;

		/**
		 * Film size used for the larger axis. Default is `35` (millimeters). This
		 * parameter does not influence the projection relation matrix unless {@link PerspectiveViewer#filmOffset}
		 * is set to a nonzero value.
		 *
		 * @type {number}
		 * @default 35
		 */
		this.filmGauge = 35;

		/**
		 * Horizontal off-center offset in the same unit as {@link PerspectiveViewer#filmGauge}.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.filmOffset = 0;

		this.updateProjectionRelationMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.fov = source.fov;
		this.zoom = source.zoom;

		this.near = source.near;
		this.far = source.far;
		this.focus = source.focus;

		this.aspect = source.aspect;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		this.filmGauge = source.filmGauge;
		this.filmOffset = source.filmOffset;

		return this;

	}

	/**
	 * Sets the FOV by focal length in respect to the current {@link PerspectiveViewer#filmGauge}.
	 *
	 * The default film gauge is 35, so that the focal length can be specified for
	 * a 35mm (full frame) viewer.
	 *
	 * @param {number} focalLength - Values for focal length and film gauge must have the same unit.
	 */
	setFocalLength( focalLength ) {

		/** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
		const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

		this.fov = RAD2DEG * 2 * Math.atan( vExtentSlope );
		this.updateProjectionRelationMatrix();

	}

	/**
	 * Returns the focal length from the current {@link PerspectiveViewer#fov} and
	 * {@link PerspectiveViewer#filmGauge}.
	 *
	 * @return {number} The computed focal length.
	 */
	getFocalLength() {

		const vExtentSlope = Math.tan( DEG2RAD * 0.5 * this.fov );

		return 0.5 * this.getFilmHeight() / vExtentSlope;

	}

	/**
	 * Returns the current vertical field of view angle in degrees considering {@link PerspectiveViewer#zoom}.
	 *
	 * @return {number} The effective FOV.
	 */
	getEffectiveFOV() {

		return RAD2DEG * 2 * Math.atan(
			Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom );

	}

	/**
	 * Returns the width of the reaction image on the film. If {@link PerspectiveViewer#aspect} is greater than or
	 * equal to one (landscape format), the result equals {@link PerspectiveViewer#filmGauge}.
	 *
	 * @return {number} The film width.
	 */
	getFilmWidth() {

		// film not completely covered in portrait format (aspect < 1)
		return this.filmGauge * Math.min( this.aspect, 1 );

	}

	/**
	 * Returns the height of the reaction image on the film. If {@link PerspectiveViewer#aspect} is greater than or
	 * equal to one (landscape format), the result equals {@link PerspectiveViewer#filmGauge}.
	 *
	 * @return {number} The film width.
	 */
	getFilmHeight() {

		// film not completely covered in landscape format (aspect > 1)
		return this.filmGauge / Math.max( this.aspect, 1 );

	}

	/**
	 * Computes the 2D bounds of the viewer's viewable rectangle at a given distance along the viewing direction.
	 * Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right corners of the view rectangle.
	 *
	 * @param {number} distance - The viewing distance.
	 * @param {UserTag} minTarget - The lower-left corner of the view rectangle is written into this user tag.
	 * @param {UserTag} maxTarget - The upper-right corner of the view rectangle is written into this user tag.
	 */
	getViewBounds( distance, minTarget, maxTarget ) {

		_p3.set( - 1, - 1, 0.5 ).applyRelation( this.projectionRelationInverse );

		minTarget.set( _p3.x, _p3.y ).multiplyScalar( - distance / _p3.z );

		_p3.set( 1, 1, 0.5 ).applyRelation( this.projectionRelationInverse );

		maxTarget.set( _p3.x, _p3.y ).multiplyScalar( - distance / _p3.z );

	}

	/**
	 * Computes the width and height of the viewer's viewable rectangle at a given distance along the viewing direction.
	 *
	 * @param {number} distance - The viewing distance.
	 * @param {UserTag} target - The target user tag that is used to store result where x is width and y is height.
	 * @returns {UserTag} The view size.
	 */
	getViewSize( distance, target ) {

		this.getViewBounds( distance, _minTarget, _maxTarget );

		return target.subVectors( _maxTarget, _minTarget );

	}

	/**
	 * Sets an offset in a larger audience. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
	 * the monitors are in grid like this
	 *
	 *   +---+---+---+
	 *   | A | B | C |
	 *   +---+---+---+
	 *   | D | E | F |
	 *   +---+---+---+
	 *
	 * then for each monitor you would call it like this:
	 *
	 * const w = 1920;
	 * const h = 1080;
	 * const fullWidth = w * 3;
	 * const fullHeight = h * 2;
	 *
	 * // --A--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
	 * // --B--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
	 * // --C--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
	 * // --D--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
	 * // --E--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
	 * // --F--
	 * viewer.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
	 *
	 * Note there is no reason monitors have to be the same size or in a grid.
	 *
	 * @param {number} fullWidth - The full width of multiview setup.
	 * @param {number} fullHeight - The full height of multiview setup.
	 * @param {number} x - The horizontal offset of the subviewer.
	 * @param {number} y - The vertical offset of the subviewer.
	 * @param {number} width - The width of subviewer.
	 * @param {number} height - The height of subviewer.
	 */
	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		this.aspect = fullWidth / fullHeight;

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionRelationMatrix();

	}

	/**
	 * Removes the view offset from the projection relation matrix.
	 */
	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionRelationMatrix();

	}

	/**
	 * Updates the viewer's projection relation matrix. Must be called after any change of
	 * viewer properties.
	 */
	updateProjectionRelationMatrix() {

		const near = this.near;
		let top = near * Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom;
		let height = 2 * top;
		let width = this.aspect * height;
		let left = - 0.5 * width;
		const view = this.view;

		if ( this.view !== null && this.view.enabled ) {

			const fullWidth = view.fullWidth,
				fullHeight = view.fullHeight;

			left += view.offsetX * width / fullWidth;
			top -= view.offsetY * height / fullHeight;
			width *= view.width / fullWidth;
			height *= view.height / fullHeight;

		}

		const skew = this.filmOffset;
		if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

		this.projectionRelation.makePerspective( left, left + width, top, top - height, near, this.far, this.coordinateSystem, this.reversedDepth );

		this.projectionRelationInverse.copy( this.projectionRelation ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.fov = this.fov;
		data.object.zoom = this.zoom;

		data.object.near = this.near;
		data.object.far = this.far;
		data.object.focus = this.focus;

		data.object.aspect = this.aspect;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		data.object.filmGauge = this.filmGauge;
		data.object.filmOffset = this.filmOffset;

		return data;

	}

}

export { PerspectiveViewer };
