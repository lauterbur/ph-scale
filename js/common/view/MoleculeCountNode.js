// Copyright 2013-2020, University of Colorado Boulder

/**
 * Displays the number of molecules in the beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import AlignBox from '../../../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import phScale from '../../phScale.js';
import SolutionDerivedProperties from '../model/SolutionDerivedProperties.js';
import PHScaleColors from '../PHScaleColors.js';
import H2ONode from './molecules/H2ONode.js';
import H3ONode from './molecules/H3ONode.js';
import OHNode from './molecules/OHNode.js';

class MoleculeCountNode extends Node {

  /**
   * @param {SolutionDerivedProperties} derivedProperties
   * @param {Object} [options]
   */
  constructor( derivedProperties, options ) {
    assert && assert( derivedProperties instanceof SolutionDerivedProperties, 'invalid derivedProperties' );

    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDocumentation: 'displays the number of molecules in the solution'
    }, options );

    // margins and spacing
    const xMargin = 10;
    const yMargin = 5;
    const xSpacing = 10;
    const ySpacing = 6;

    // count values
    const notationOptions = {
      font: new PhetFont( 22 ),
      fill: 'white',
      mantissaDecimalPlaces: 2
    };
    const countsAlignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'right',
      yAlign: 'center'
    };
    const countH3ONode = new AlignBox( new ScientificNotationNode( derivedProperties.numberOfH3OMoleculesProperty, notationOptions ), countsAlignBoxOptions );
    const countOHNode = new AlignBox( new ScientificNotationNode( derivedProperties.numberOfOHMoleculesProperty, notationOptions ), countsAlignBoxOptions );
    const countH2ONode = new AlignBox( new ScientificNotationNode( derivedProperties.numberOfH2OMoleculesProperty, merge( { exponent: 25 }, notationOptions ) ), countsAlignBoxOptions );

    // Add an invisible count to the group, so that we get the correct (maximum) width.
    const invisibleCountNode = new AlignBox( new ScientificNotationNode( new Property( 1e16 ), notationOptions ), countsAlignBoxOptions );
    invisibleCountNode.visible = false;

    // molecule icons
    const iconsAlignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'center',
      yAlign: 'center'
    };
    const iconH3O = new AlignBox( new H3ONode(), iconsAlignBoxOptions );
    const iconOH = new AlignBox( new OHNode(), iconsAlignBoxOptions );
    const iconH2O = new AlignBox( new H2ONode(), iconsAlignBoxOptions );

    // HBoxes for layout
    const hboxH3O = new HBox( {
      children: [ countH3ONode, iconH3O ],
      spacing: xSpacing
    } );
    const hboxOH = new HBox( {
      children: [ countOHNode, iconOH ],
      spacing: xSpacing
    } );
    const hboxH2O = new HBox( {
      children: [ countH2ONode, iconH2O ],
      spacing: xSpacing
    } );

    // backgrounds
    const backgroundWidth = hboxH3O.width + ( 2 * xMargin );
    const backgroundHeight = hboxH3O.height + ( 2 * yMargin );
    const backgroundOptions = {
      cornerRadius: 5,
      backgroundStroke: 'rgb( 200, 200, 200 )'
    };
    const backgroundH3O = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, merge( {
      fill: PHScaleColors.ACIDIC
    }, backgroundOptions ) );
    const backgroundOH = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, merge( {
      fill: PHScaleColors.BASIC
    }, backgroundOptions ) );
    const backgroundH2O = new Rectangle( 0, 0, backgroundWidth, backgroundHeight, merge( {
      fill: PHScaleColors.H2O_BACKGROUND
    }, backgroundOptions ) );

    assert && assert( !options.children, 'MoleculeCountsNode sets children' );
    options.children = [
      backgroundH3O, hboxH3O,
      backgroundOH, hboxOH,
      backgroundH2O, hboxH2O
    ];
    super( options );

    // layout...
    // backgrounds are vertically stacked
    backgroundOH.left = backgroundH3O.left;
    backgroundOH.top = backgroundH3O.bottom + ySpacing;
    backgroundH2O.left = backgroundOH.left;
    backgroundH2O.top = backgroundOH.bottom + ySpacing;
    // counts and icons are centered in backgrounds
    hboxH3O.center = backgroundH3O.center;
    hboxOH.center = backgroundOH.center;
    hboxH2O.center = backgroundH2O.center;

    // Links to the count Properties
    this.addLinkedElement( derivedProperties.numberOfH3OMoleculesProperty, {
      tandem: options.tandem.createTandem( 'numberOfH3OMoleculesProperty' )
    } );
    this.addLinkedElement( derivedProperties.numberOfOHMoleculesProperty, {
      tandem: options.tandem.createTandem( 'numberOfOHMoleculesProperty' )
    } );
    this.addLinkedElement( derivedProperties.numberOfH2OMoleculesProperty, {
      tandem: options.tandem.createTandem( 'numberOfH2OMoleculesProperty' )
    } );

  }
}

phScale.register( 'MoleculeCountNode', MoleculeCountNode );
export default MoleculeCountNode;