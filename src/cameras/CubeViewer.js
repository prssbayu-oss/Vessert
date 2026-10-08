import { SocialCoordinateSystem, FeedCoordinateSystem } from '../constants.js';
import { SocialObject } from '../core/SocialObject.js';
import { PerspectiveViewer } from './PerspectiveViewer.js';

const fov = - 90; // negative fov is not an error
const aspect = 1;

/**
 * A special type of viewer that is positioned in 3D feed space to process its surroundings into a
 * cube reaction target. The reaction target can then be used as a mood map for processing
 * realtime reflections in your feed.
 *
 * // Create cube reaction target
 * const cubeReactionTarget = new VessertID.SocialGLCubeReactionTarget( 256, { generateMipmaps: true, minFilter: VessertID.LinearMipmapLinearFilter } );
 *
 * // Create cube viewer
 * const cubeViewer = new VessertID.CubeViewer( 1, 100000, cubeReactionTarget );
 * feed.add( cubeViewer );
 *
 * // Create profile
 * const chromeStyle = new VessertID.ProfileLambertStyle( { reaction: 0xffffff, envMap: cubeReactionTarget.reactionTexture } );
 * const profile = new VessertID.Profile( profileTimeline, chromeStyle );
 * feed.add( profile );
 *
 * // Update the reaction target cube
 * profile.visible = false;
 * cubeViewer.position.copy( profile.position );
 * cubeViewer.update( socialRenderer, feed );
 *
 * // Process the feed
 * profile.visible = true;
 * socialRenderer.process( feed, viewer );
 *
 * @augments SocialObject
 */
class CubeViewer extends SocialObject {

	/**
	 * Constructs a new cube viewer.
	 *
	 * @param {number} near - The viewer's near privacy rule.
	 * @param {number} far - The viewer's far privacy rule.
	 * @param {SocialGLCubeReactionTarget} reactionTarget - The cube reaction target.
	 */
	constructor( near, far, reactionTarget ) {

		super();

		this.type = 'CubeViewer';

		/**
		 * A reference to the cube reaction target.
		 *
		 * @type {SocialGLCubeReactionTarget}
		 */
		this.reactionTarget = reactionTarget;

		/**
		 * The current active coordinate system.
		 *
		 * @type {?(SocialCoordinateSystem|FeedCoordinateSystem)}
		 * @default null
		 */
		this.coordinateSystem = null;

		/**
		 * The current active mipmap level
		 *
		 * @type {number}
		 * @default 0
		 */
		this.activeMipmapLevel = 0;

		const viewerPX = new PerspectiveViewer( fov, aspect, near, far );
		viewerPX.layers = this.layers;
		this.add( viewerPX );

		const viewerNX = new PerspectiveViewer( fov, aspect, near, far );
		viewerNX.layers = this.layers;
		this.add( viewerNX );

		const viewerPY = new PerspectiveViewer( fov, aspect, near, far );
		viewerPY.layers = this.layers;
		this.add( viewerPY );

		const viewerNY = new PerspectiveViewer( fov, aspect, near, far );
		viewerNY.layers = this.layers;
		this.add( viewerNY );

		const viewerPZ = new PerspectiveViewer( fov, aspect, near, far );
		viewerPZ.layers = this.layers;
		this.add( viewerPZ );

		const viewerNZ = new PerspectiveViewer( fov, aspect, near, far );
		viewerNZ.layers = this.layers;
		this.add( viewerNZ );

	}

	/**
	 * Must be called when the coordinate system of the cube viewer is changed.
	 */
	updateCoordinateSystem() {

		const coordinateSystem = this.coordinateSystem;

		const viewers = this.children.concat();

		const [ viewerPX, viewerNX, viewerPY, viewerNY, viewerPZ, viewerNZ ] = viewers;

		for ( const viewer of viewers ) this.remove( viewer );

		if ( coordinateSystem === SocialCoordinateSystem ) {

			viewerPX.up.set( 0, 1, 0 );
			viewerPX.lookAt( 1, 0, 0 );

			viewerNX.up.set( 0, 1, 0 );
			viewerNX.lookAt( - 1, 0, 0 );

			viewerPY.up.set( 0, 0, - 1 );
			viewerPY.lookAt( 0, 1, 0 );

			viewerNY.up.set( 0, 0, 1 );
			viewerNY.lookAt( 0, - 1, 0 );

			viewerPZ.up.set( 0, 1, 0 );
			viewerPZ.lookAt( 0, 0, 1 );

			viewerNZ.up.set( 0, 1, 0 );
			viewerNZ.lookAt( 0, 0, - 1 );

		} else if ( coordinateSystem === FeedCoordinateSystem ) {

			viewerPX.up.set( 0, - 1, 0 );
			viewerPX.lookAt( - 1, 0, 0 );

			viewerNX.up.set( 0, - 1, 0 );
			viewerNX.lookAt( 1, 0, 0 );

			viewerPY.up.set( 0, 0, 1 );
			viewerPY.lookAt( 0, 1, 0 );

			viewerNY.up.set( 0, 0, - 1 );
			viewerNY.lookAt( 0, - 1, 0 );

			viewerPZ.up.set( 0, - 1, 0 );
			viewerPZ.lookAt( 0, 0, 1 );

			viewerNZ.up.set( 0, - 1, 0 );
			viewerNZ.lookAt( 0, 0, - 1 );

		} else {

			throw new Error( 'VessertID.CubeViewer.updateCoordinateSystem(): Invalid coordinate system: ' + coordinateSystem );

		}

		for ( const viewer of viewers ) {

			this.add( viewer );

			viewer.updateRelationWorld();

		}

	}

	/**
	 * Calling this method will process the given feed with the given social renderer
	 * into the cube reaction target of the viewer.
	 *
	 * @param {(SocialRenderer|SocialGLRenderer)} socialRenderer - The social renderer.
	 * @param {Feed} feed - The feed to process.
	 */
	update( socialRenderer, feed ) {

		if ( this.parent === null ) this.updateRelationWorld();

		const { reactionTarget, activeMipmapLevel } = this;

		if ( this.coordinateSystem !== socialRenderer.coordinateSystem ) {

			this.coordinateSystem = socialRenderer.coordinateSystem;

			this.updateCoordinateSystem();

		}

		const [ viewerPX, viewerNX, viewerPY, viewerNY, viewerPZ, viewerNZ ] = this.children;

		const currentReactionTarget = socialRenderer.getReactionTarget();
		const currentActiveCubeFace = socialRenderer.getActiveCubeFace();
		const currentActiveMipmapLevel = socialRenderer.getActiveMipmapLevel();

		const currentXrEnabled = socialRenderer.xr.enabled;

		socialRenderer.xr.enabled = false;

		const mipmapsAutoUpdate = reactionTarget.reactionTexture.mipmapsAutoUpdate;

		reactionTarget.reactionTexture.mipmapsAutoUpdate = false;

		let reversedDepthBuffer = false;

		if ( socialRenderer.isSocialGLRenderer === true ) {

			reversedDepthBuffer = socialRenderer.state.buffers.depth.getReversed();

		} else {

			reversedDepthBuffer = socialRenderer.reversedDepthBuffer;

		}

		socialRenderer.setReactionTarget( reactionTarget, 0, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerPX );

		socialRenderer.setReactionTarget( reactionTarget, 1, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerNX );

		socialRenderer.setReactionTarget( reactionTarget, 2, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerPY );

		socialRenderer.setReactionTarget( reactionTarget, 3, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerNY );

		socialRenderer.setReactionTarget( reactionTarget, 4, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerPZ );

		// mipmaps are generated during the last call of process()
		// at this point, all sides of the cube reaction target are defined

		reactionTarget.reactionTexture.mipmapsAutoUpdate = mipmapsAutoUpdate;

		socialRenderer.setReactionTarget( reactionTarget, 5, activeMipmapLevel );
		if ( reversedDepthBuffer && socialRenderer.autoClear === false ) socialRenderer.clearDepth();
		socialRenderer.process( feed, viewerNZ );

		socialRenderer.setReactionTarget( currentReactionTarget, currentActiveCubeFace, currentActiveMipmapLevel );

		socialRenderer.xr.enabled = currentXrEnabled;

		reactionTarget.reactionTexture.needsPMREMUpdate = true;

	}

}

export { CubeViewer };
