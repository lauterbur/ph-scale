// Copyright 2013-2020, University of Colorado Boulder

/**
 * View for the 'Macro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const BeakerNode = require( 'PH_SCALE/common/view/BeakerNode' );
  const DrainFaucetNode = require( 'PH_SCALE/common/view/DrainFaucetNode' );
  const DropperFluidNode = require( 'PH_SCALE/common/view/DropperFluidNode' );
  const EyeDropperNode = require( 'SCENERY_PHET/EyeDropperNode' );
  const FaucetFluidNode = require( 'PH_SCALE/common/view/FaucetFluidNode' );
  const MacroPHMeterNode = require( 'PH_SCALE/macro/view/MacroPHMeterNode' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const NeutralIndicatorNode = require( 'PH_SCALE/macro/view/NeutralIndicatorNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PHDropperNode = require( 'PH_SCALE/common/view/PHDropperNode' );
  const phScale = require( 'PH_SCALE/phScale' );
  const PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  const Property = require( 'AXON/Property' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SoluteComboBox = require( 'PH_SCALE/common/view/SoluteComboBox' );
  const SolutionNode = require( 'PH_SCALE/common/view/SolutionNode' );
  const Tandem = require( 'TANDEM/Tandem' );
  const VolumeIndicatorNode = require( 'PH_SCALE/common/view/VolumeIndicatorNode' );
  const Water = require( 'PH_SCALE/common/model/Water' );
  const WaterFaucetNode = require( 'PH_SCALE/common/view/WaterFaucetNode' );

  class MacroScreenView extends ScreenView {

    /**
     * @param {MacroModel} model
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Tandem} tandem
     */
    constructor( model, modelViewTransform, tandem ) {
      assert && assert( tandem instanceof Tandem, 'invalid tandem' );
      assert && assert( modelViewTransform instanceof ModelViewTransform2, 'invalid modelViewTransform' );

      super( merge( {}, PHScaleConstants.SCREEN_VIEW_OPTIONS, {
        tandem: tandem
      } ) );

      // beaker
      const beakerNode = new BeakerNode( model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'beakerNode' )
      } );

      // solution in the beaker
      const solutionNode = new SolutionNode( model.solution, model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'solutionNode' )
      } );

      // volume indicator on the right edge of beaker
      const volumeIndicatorNode = new VolumeIndicatorNode( model.solution.volumeProperty, model.beaker, modelViewTransform, {
        tandem: tandem.createTandem( 'volumeIndicatorNode' )
      } );

      // Neutral indicator that appears in the bottom of the beaker.
      const neutralIndicatorNode = new NeutralIndicatorNode( model.solution, {
        tandem: tandem.createTandem( 'neutralIndicatorNode' )
      } );

      // dropper
      const DROPPER_SCALE = 0.85;
      const dropperNode = new PHDropperNode( model.dropper, modelViewTransform, {
        tandem: tandem.createTandem( 'dropperNode' )
      });
      dropperNode.setScaleMagnitude( DROPPER_SCALE );
      const dropperFluidNode = new DropperFluidNode( model.dropper, model.beaker, DROPPER_SCALE * EyeDropperNode.TIP_WIDTH, modelViewTransform );

      // faucets
      const waterFaucetNode = new WaterFaucetNode( model.waterFaucet, modelViewTransform, {
        tandem: tandem.createTandem( 'waterFaucetNode' )
      } );
      const drainFaucetNode = new DrainFaucetNode( model.drainFaucet, modelViewTransform, {
        tandem: tandem.createTandem( 'drainFaucetNode' )
      } );
      const WATER_FLUID_HEIGHT = model.beaker.position.y - model.waterFaucet.position.y;
      const DRAIN_FLUID_HEIGHT = 1000; // tall enough that resizing the play area is unlikely to show bottom of fluid
      //TODO #92 should fluid nodes be children of faucet nodes? should fluid nodes be instrumented?
      const waterFluidNode = new FaucetFluidNode( model.waterFaucet, new Property( Water.color ), WATER_FLUID_HEIGHT, modelViewTransform, {
        tandem: tandem.createTandem( 'waterFluidNode' )
      } );
      const drainFluidNode = new FaucetFluidNode( model.drainFaucet, model.solution.colorProperty, DRAIN_FLUID_HEIGHT, modelViewTransform, {
        tandem: tandem.createTandem( 'drainFluidNode' )
      } );

      // pH meter
      const pHMeterNode = new MacroPHMeterNode( model.pHMeter, model.solution, model.dropper,
        solutionNode, dropperFluidNode, waterFluidNode, drainFluidNode, modelViewTransform, {
          tandem: tandem.createTandem( 'pHMeterNode' )
        } );

      // solutes combo box
      const soluteListParent = new Node();
      const soluteComboBox = new SoluteComboBox( model.solutes, model.dropper.soluteProperty, soluteListParent, {
        maxWidth: 400,
        tandem: tandem.createTandem( 'soluteComboBox' )
      } );

      const resetAllButton = new ResetAllButton( {
        scale: 1.32,
        listener: () => {
          model.reset();
        },
        tandem: tandem.createTandem( 'resetAllButton' )
      } );

      // Parent for all nodes added to this screen
      const rootNode = new Node( {
        children: [
          // nodes are rendered in this order
          waterFluidNode,
          waterFaucetNode,
          drainFluidNode,
          drainFaucetNode,
          dropperFluidNode,
          dropperNode,
          solutionNode,
          beakerNode,
          neutralIndicatorNode,
          volumeIndicatorNode,
          soluteComboBox,
          resetAllButton,
          pHMeterNode, // next to last so that probe doesn't get lost behind anything
          soluteListParent // last, so that combo box list is on top
        ]
      } );
      this.addChild( rootNode );

      // Layout of nodes that don't have a position specified in the model
      soluteComboBox.left = modelViewTransform.modelToViewX( model.beaker.left ) - 20; // anchor on left so it grows to the right during i18n
      soluteComboBox.top = this.layoutBounds.top + 15;
      neutralIndicatorNode.centerX = beakerNode.centerX;
      neutralIndicatorNode.bottom = beakerNode.bottom - 30;
      resetAllButton.right = this.layoutBounds.right - 40;
      resetAllButton.bottom = this.layoutBounds.bottom - 20;

      model.isAutoFillingProperty.link( isAutoFilling => {
        dropperNode.interruptSubtreeInput();
      } );
    }
  }

  return phScale.register( 'MacroScreenView', MacroScreenView );
} );
