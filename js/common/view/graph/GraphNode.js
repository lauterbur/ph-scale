// Copyright 2013-2020, University of Colorado Boulder

/**
 * Container for all components related to the graph feature.
 * It has an expand/collapse bar at the top of it, and can switch between 'concentration' and 'quantity'.
 * Logarithmic graph is the standard scale. Interactivity and a linear scale are optional.
 * Origin is at top-left of the expand/collapse bar.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../../phet-core/js/merge.js';
import Line from '../../../../../scenery/js/nodes/Line.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import phScale from '../../../phScale.js';
import SolutionDerivedProperties from '../../model/SolutionDerivedProperties.js';
import GraphControlPanel from './GraphControlPanel.js';
import GraphScale from './GraphScale.js';
import GraphScaleSwitch from './GraphScaleSwitch.js';
import GraphUnits from './GraphUnits.js';
import LinearGraphNode from './LinearGraphNode.js';
import LogarithmicGraphNode from './LogarithmicGraphNode.js';

class GraphNode extends Node {

  /**
   * @param {Property.<number>} pHProperty
   * @param {Property.<number>} totalVolumeProperty
   * @param {SolutionDerivedProperties} derivedProperties
   * @param {Object} [options]
   */
  constructor( pHProperty, totalVolumeProperty, derivedProperties, options ) {
    assert && assert( derivedProperties instanceof SolutionDerivedProperties, 'invalid derivedProperties' );

    options = merge( {
      isInteractive: false, // if true, add drag handlers for changing H3O+ and OH- on the Logarithmic graph
      logScaleHeight: 500,
      linearScaleHeight: 500,
      units: GraphUnits.MOLES_PER_LITER, // initial state of the units switch
      hasLinearFeature: false, // add the linear graph feature?
      graphScale: GraphScale.LOGARITHMIC, // initial state of the scale switch, meaningful only if hasLinearFeature === true

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    super();

    // whether the graph is expanded or collapsed
    const expandedProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'expandedProperty' )
    } );

    // units used for the graph
    const graphUnitsProperty = new EnumerationProperty( GraphUnits, options.units, {
      tandem: options.tandem.createTandem( 'graphUnitsProperty' )
    } );

    // control panel above the graph
    const graphControlPanel = new GraphControlPanel( graphUnitsProperty, expandedProperty, {
      tandem: options.tandem.createTandem( 'graphControlPanel' )
    } );
    this.addChild( graphControlPanel );

    // vertical line that connects bottom of graphControlPanel to top of graph
    const lineToPanel = new Line( 0, 0, 0, 75, { stroke: 'black' } );
    graphControlPanel.visibleProperty.lazyLink( () => {
      lineToPanel.visible = graphControlPanel.visible;
    } );

    // logarithmic graph
    const logarithmicGraphNode = new LogarithmicGraphNode( pHProperty, totalVolumeProperty, derivedProperties, graphUnitsProperty, {
      scaleHeight: options.logScaleHeight,
      isInteractive: options.isInteractive,
      centerX: lineToPanel.centerX,
      y: 30, // y, not top
      tandem: options.tandem.createTandem( 'logarithmicGraphNode' )
    } );

    // parent for things whose visibility will be controlled by expandProperty
    const parentNode = new Node( {
      children: [ lineToPanel, logarithmicGraphNode ],
      centerX: graphControlPanel.centerX,
      y: graphControlPanel.bottom // y, not top
    } );
    this.addChild( parentNode );

    // controls the visibility of parentNode
    expandedProperty.link( expanded => {
      parentNode.visible = expanded;
    } );

    // @private {LinearGraphNode|null} optional linear graph
    let linearGraphNode = null;
    let graphScaleProperty = null;
    if ( options.hasLinearFeature ) {

      // scale (log, linear) of the graph
      graphScaleProperty = new EnumerationProperty( GraphScale, options.graphScale, {
        tandem: options.tandem.createTandem( 'graphScaleProperty' )
      } );

      // linear graph
      linearGraphNode = new LinearGraphNode( derivedProperties, graphUnitsProperty, {
        scaleHeight: options.linearScaleHeight,
        y: logarithmicGraphNode.y, // y, not top
        centerX: logarithmicGraphNode.centerX,
        tandem: options.tandem.createTandem( 'linearGraphNode' )
      } );

      // scale switch (Logarithmic vs Linear)
      const graphScaleSwitch = new GraphScaleSwitch( graphScaleProperty, {
        centerX: lineToPanel.centerX,
        top: linearGraphNode.bottom + 15,
        tandem: options.tandem.createTandem( 'graphScaleSwitch' )
      } );

      // vertical line that connects bottom of graph to top of scale switch
      const lineToSwitchNode = new Line( 0, 0, 0, 200, {
        stroke: 'black',
        centerX: lineToPanel.centerX,
        bottom: graphScaleSwitch.top + 1
      } );

      graphScaleSwitch.visibleProperty.lazyLink( () => {
        lineToSwitchNode.visible = graphScaleSwitch.visible;
      } );

      // add everything to parentNode, since their visibility is controlled by expandedProperty
      parentNode.addChild( lineToSwitchNode );
      lineToSwitchNode.moveToBack();
      parentNode.addChild( linearGraphNode );
      parentNode.addChild( graphScaleSwitch );

      // handle scale changes
      graphScaleProperty.link( graphScale => {
        logarithmicGraphNode.visible = ( graphScale === GraphScale.LOGARITHMIC );
        linearGraphNode.visible = ( graphScale === GraphScale.LINEAR );
      } );
    }

    this.mutate( options );

    // @private
    this.resetGraphNode = () => {
      expandedProperty.reset();
      graphUnitsProperty.reset();
      graphScaleProperty && graphScaleProperty.reset();
      linearGraphNode && linearGraphNode.reset();
    };

    // Link to concentration Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement( derivedProperties.concentrationH2OProperty, {
      tandem: options.tandem.createTandem( 'concentrationH2OProperty' )
    } );
    this.addLinkedElement( derivedProperties.concentrationH3OProperty, {
      tandem: options.tandem.createTandem( 'concentrationH3OProperty' )
    } );
    this.addLinkedElement( derivedProperties.concentrationOHProperty, {
      tandem: options.tandem.createTandem( 'concentrationOHProperty' )
    } );

    // Link to quantity Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement( derivedProperties.quantityH2OProperty, {
      tandem: options.tandem.createTandem( 'quantityH2OProperty' )
    } );
    this.addLinkedElement( derivedProperties.quantityH3OProperty, {
      tandem: options.tandem.createTandem( 'quantityH3OProperty' )
    } );
    this.addLinkedElement( derivedProperties.quantityOHProperty, {
      tandem: options.tandem.createTandem( 'quantityOHProperty' )
    } );
  }

  /**
   * @public
   */
  reset() {
    this.resetGraphNode();
  }
}

phScale.register( 'GraphNode', GraphNode );
export default GraphNode;