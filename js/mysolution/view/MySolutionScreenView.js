// Copyright 2013-2020, University of Colorado Boulder

/**
 * View for the 'My Solution' screen.
 *
 * NOTE:
 * This view currently consists of a subset of the nodes in the 'Micro' screen.
 * But some of the common nodes are configured differently, and the screen has different layering and layout requirements.
 * So I choose to duplicate some code rather than attempt a refactor that would result in an implementation that
 * was more difficult to understand and maintain.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const BeakerControlPanel = require( 'PH_SCALE/common/view/BeakerControlPanel' );
  const BeakerNode = require( 'PH_SCALE/common/view/BeakerNode' );
  const GraphNode = require( 'PH_SCALE/common/view/graph/GraphNode' );
  const merge = require( 'PHET_CORE/merge' );
  const MoleculeCountNode = require( 'PH_SCALE/common/view/MoleculeCountNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PHMeterNode = require( 'PH_SCALE/common/view/PHMeterNode' );
  const phScale = require( 'PH_SCALE/phScale' );
  const PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  const PHScaleViewProperties = require( 'PH_SCALE/common/view/PHScaleViewProperties' );
  const RatioNode = require( 'PH_SCALE/common/view/RatioNode' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SolutionNode = require( 'PH_SCALE/common/view/SolutionNode' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VolumeIndicatorNode = require( 'PH_SCALE/common/view/VolumeIndicatorNode' );

  class MySolutionScreenView extends ScreenView {

    /**
     * @param {MySolutionModel} model
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Tandem} tandem
     */
    constructor( model, modelViewTransform, tandem ) {
      assert && assert( tandem instanceof Tandem, 'invalid tandem' );
      assert && assert( modelViewTransform instanceof ModelViewTransform2, 'invalid modelViewTransform' );

      super( merge( {}, PHScaleConstants.SCREEN_VIEW_OPTIONS, {
        tandem: tandem
      } ) );

      // view-specific properties
      const viewProperties = new PHScaleViewProperties( tandem.createTandem( 'viewProperties' ) );

      // beaker
      const beakerNode = new BeakerNode( model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'beakerNode' )
      } );

      // solution in the beaker
      const solutionNode = new SolutionNode( model.solution, model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'solutionNode' )
      } );

      // volume indicator along the right edge of the beaker
      const volumeIndicatorNode = new VolumeIndicatorNode( model.solution.volumeProperty, model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'volumeIndicatorNode' )
      } );

      // 'H3O+/OH- ratio' representation
      const ratioNode = new RatioNode( model.beaker, model.solution, modelViewTransform, {
        visible: viewProperties.ratioVisibleProperty.get(),
        tandem: tandem.createTandem( 'ratioNode' )
      } );
      viewProperties.ratioVisibleProperty.linkAttribute( ratioNode, 'visible' );

      // 'molecule count' representation
      const moleculeCountNode = new MoleculeCountNode( model.solution, {
        tandem: tandem.createTandem( 'moleculeCountNode' )
      } );
      viewProperties.moleculeCountVisibleProperty.linkAttribute( moleculeCountNode, 'visible' );

      // beaker controls
      const beakerControlPanel = new BeakerControlPanel(
        viewProperties.ratioVisibleProperty,
        viewProperties.moleculeCountVisibleProperty, {
          maxWidth: 0.85 * beakerNode.width,
          tandem: tandem.createTandem( 'beakerControlPanel' )
        } );

      // graph
      const graphNode = new GraphNode( model.solution, {
        isInteractive: true,
        logScaleHeight: 565,
        tandem: tandem.createTandem( 'graphNode' )
      } );

      // pH meter
      const pHMeterTop = 15;
      const pHMeterNode = new PHMeterNode( model.solution,
        modelViewTransform.modelToViewY( model.beaker.position.y ) - pHMeterTop, {
          attachProbe: 'right',
          isInteractive: true,
          tandem: tandem.createTandem( 'pHMeterNode' )
        } );

      const resetAllButton = new ResetAllButton( {
        scale: 1.32,
        listener: () => {
          model.reset();
          viewProperties.reset();
          graphNode.reset();
          pHMeterNode.reset();
        },
        tandem: tandem.createTandem( 'resetAllButton' )
      } );

      // Parent for all nodes added to this screen
      const rootNode = new Node( {
        children: [
          // nodes are rendered in this order
          solutionNode,
          pHMeterNode,
          ratioNode,
          beakerNode,
          moleculeCountNode,
          volumeIndicatorNode,
          beakerControlPanel,
          graphNode,
          resetAllButton
        ]
      } );
      this.addChild( rootNode );

      // Layout of nodes that don't have a position specified in the model
      pHMeterNode.left = beakerNode.left;
      pHMeterNode.top = pHMeterTop;
      moleculeCountNode.centerX = beakerNode.centerX;
      moleculeCountNode.bottom = beakerNode.bottom - 25;
      beakerControlPanel.centerX = beakerNode.centerX;
      beakerControlPanel.top = beakerNode.bottom + 10;
      graphNode.right = beakerNode.left - 70;
      graphNode.top = pHMeterNode.top;
      resetAllButton.right = this.layoutBounds.right - 40;
      resetAllButton.bottom = this.layoutBounds.bottom - 20;
    }
  }

  return phScale.register( 'MySolutionScreenView', MySolutionScreenView );
} );
