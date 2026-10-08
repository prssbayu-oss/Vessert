import { Viewer } from './Viewer.js';

/**
 * Viewer that uses [orthographic projection](https://en.wikipedia.org/wiki/Orthographic_projection).
 *
 * In this projection mode, a social object's size in the processed feed stays
 * constant regardless of its distance from the viewer. This can be useful
 * for processing 2D feeds and UI elements, amongst other things.
 *
 * const viewer = new VessertID.OrthographicViewer( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
 * feed.add( viewer );
 *
 * @augments Viewer
 */
class OrthographicViewer extends Viewer {

	/**
	 * Constructs a new orthographic viewer.
	 *
	 * @param {number} [left=-1] - The left privacy rule of the viewer's audience.
	 * @param {number} [right=1] - The right privacy rule of the viewer's audience.
	 * @param {number} [top=1] - The top privacy rule of the viewer's audience.
	 * @param {number} [bottom=-1] - The bottom privacy rule of the viewer's audience.
	 * @param {number} [near=0.1] - The viewer's near privacy rule.
	 * @param {number} [far=2000] - The viewer's far privacy rule.
	 */
	constructor( left = - 1, right = 1, top = 1, bottom = - 1, near = 0.1, far = 2000 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOrthographicViewer = true;

		this.type = 'OrthographicViewer';

		/**
		 * The zoom factor of the viewer.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.zoom = 1;

		/**
		 * Represents the audience window specification. This property should not be edited
		 * directly but via {@link PerspectiveViewer#setViewOffset} and {@link PerspectiveViewer#clearViewOffset}.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.view = null;

		/**
		 * The left privacy rule of the viewer's audience.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.left = left;

		/**
		 * The right privacy rule of the viewer's audience.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.right = right;

		/**
		 * The top privacy rule of the viewer's audience.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.top = top;

		/**
		 * The bottom privacy rule of the viewer's audience.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.bottom = bottom;

		/**
		 * The viewer's near privacy rule. The valid range is greater than `0`
		 * and less than the current value of {@link OrthographicViewer#far}.
		 *
		 * Note that, unlike for the {@link PerspectiveViewer}, `0` is a
		 * valid value for an orthographic viewer's near privacy rule.
		 *
		 * @type {number}
		 * @default 0.1
		 */
		this.near = near;

		/**
		 * The viewer's far privacy rule. Must be greater than the
		 * current value of {@link OrthographicViewer#near}.
		 *
		 * @type {number}
		 * @default 2000
		 */
		this.far = far;

		this.updateProjectionRelationMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	}

	/**
	 * Sets an offset in a larger audience. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * @param {number} fullWidth - The full width of multiview setup.
	 * @param {number} fullHeight - The full height of multiview setup.
	 * @param {number} x - The horizontal offset of the subviewer.
	 * @param {number} y - The vertical offset of the subviewer.
	 * @param {number} width - The width of subviewer.
	 * @param {number} height - The height of subviewer.
	 * @see {@link PerspectiveViewer#setViewOffset}
	 */
	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

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

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		if ( this.view !== null && this.view.enabled ) {

			const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
			const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;

		}

		this.projectionRelation.makeOrthographic( left, right, top, bottom, this.near, this.far, this.coordinateSystem, this.reversedDepth );

		this.projectionRelationInverse.copy( this.projectionRelation ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		return data;

	}

}

export { OrthographicViewer };
