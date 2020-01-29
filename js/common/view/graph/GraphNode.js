// Copyright 2013-2020, University of Colorado Boulder

/**
 * Container for all components related to the graph feature.
 * It has an expand/collapse bar at the top of it, and can switch between 'concentration' and 'quantity'.
 * Logarithmic graph is the standard scale. Interactivity and a linear scale are optional.
 * Origin is at top-left of the expand/collapse bar.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ABSwitch = require( 'SUN/ABSwitch' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const ExpandCollapseBar = require( 'SUN/ExpandCollapseBar' );
  const GraphScale = require( 'PH_SCALE/common/view/graph/GraphScale' );
  const GraphUnits = require( 'PH_SCALE/common/view/graph/GraphUnits' );
  const Line = require( 'SCENERY/nodes/Line' );
  const LinearGraph = require( 'PH_SCALE/common/view/graph/LinearGraph' );
  const LogarithmicGraph = require( 'PH_SCALE/common/view/graph/LogarithmicGraph' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const phScale = require( 'PH_SCALE/phScale' );
  const PHScaleColors = require( 'PH_SCALE/common/PHScaleColors' );
  const PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringProperty = require( 'AXON/StringProperty' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // strings
  const concentrationString = require( 'string!PH_SCALE/concentration' );
  const linearString = require( 'string!PH_SCALE/linear' );
  const logarithmicString = require( 'string!PH_SCALE/logarithmic' );
  const quantityString = require( 'string!PH_SCALE/quantity' );
  const unitsMolesPerLiterString = require( 'string!PH_SCALE/units.molesPerLiter' );
  const unitsMolesString = require( 'string!PH_SCALE/units.moles' );

  // constants
  const AB_SWITCH_FONT = new PhetFont( { size: 18, weight: 'bold' } );

  class GraphNode extends Node {

    /**
     * @param {Solution} solution
     * @param {Property.<boolean>} expandedProperty
     * @param {Object} [options]
     */
    constructor( solution, expandedProperty, options ) {

      options = merge( {
        isInteractive: false, // only the Log scale can be interactive
        logScaleHeight: 500,
        linearScaleHeight: 500,
        units: GraphUnits.MOLES_PER_LITER, // initial state of the units switch
        hasLinearFeature: false, // add the linear graph feature?
        graphScale: GraphScale.LOGARITHMIC // initial state of the scale switch, meaningful only if hasLinearFeature === true
      }, options );

      super();

      const mantissaRange = PHScaleConstants.LINEAR_MANTISSA_RANGE;
      const exponentRange = PHScaleConstants.LINEAR_EXPONENT_RANGE;

      // @private Properties specific to GraphNode
      this.graphUnitsProperty = new StringProperty( options.units );
      this.exponentProperty = new NumberProperty( exponentRange.max ); // {number} exponent on the linear graph
      this.graphScaleProperty = new StringProperty( options.graphScale ); // {number} scale on the linear graph

      // expand/collapse bar
      const expandCollapseBar = new ExpandCollapseBar(
        new Text( '' ),
        expandedProperty, {
          minWidth: 350,
          minHeight: 55,
          barFill: PHScaleColors.PANEL_FILL,
          barLineWidth: 2,
          buttonLength: PHScaleConstants.EXPAND_COLLAPSE_BUTTON_LENGTH
        } );

      // units switch (Concentration vs Quantity)
      const graphUnitsSwitch = new ABSwitch( this.graphUnitsProperty,
        GraphUnits.MOLES_PER_LITER, new RichText( concentrationString + '<br>(' + unitsMolesPerLiterString + ')', {
          align: 'center',
          font: AB_SWITCH_FONT,
          maxWidth: 125
        } ),
        GraphUnits.MOLES, new RichText( quantityString + '<br>(' + unitsMolesString + ')', {
          align: 'center',
          font: AB_SWITCH_FONT,
          maxWidth: 85
        } ), {
          size: new Dimension2( 50, 25 ),
          centerOnButton: true,
          center: expandCollapseBar.center
        } );

      // logarithmic graph
      const logarithmicGraph = new LogarithmicGraph( solution, this.graphUnitsProperty, {
        scaleHeight: options.logScaleHeight,
        isInteractive: options.isInteractive
      } );

      // vertical line that connects bottom of expand/collapse bar to top of graph
      const lineToBarNode = new Line( 0, 0, 0, 75, { stroke: 'black' } );

      // rendering order
      this.addChild( expandCollapseBar );
      this.addChild( graphUnitsSwitch );
      const graphNode = new Node();
      this.addChild( graphNode );
      graphNode.addChild( lineToBarNode );
      graphNode.addChild( logarithmicGraph );

      // layout
      logarithmicGraph.centerX = lineToBarNode.centerX;
      logarithmicGraph.y = 30; // y, not top
      graphNode.centerX = expandCollapseBar.centerX;
      graphNode.y = expandCollapseBar.bottom; // y, not top

      // expand/collapse the graph
      expandedProperty.link( expanded => {
        graphNode.visible = expanded;
      } );

      // optional linear graph
      this.hasLinearFeature = options.hasLinearFeature; // @private
      if ( this.hasLinearFeature ) {

        // linear graph
        const linearGraph = new LinearGraph( solution, this.graphUnitsProperty, mantissaRange, this.exponentProperty, {
          scaleHeight: options.linearScaleHeight
        } );

        // zoom buttons for the linear graph
        const magnifyingGlassRadius = 13;
        const zoomOutButton = new ZoomButton( { in: false, radius: magnifyingGlassRadius } );
        const zoomInButton = new ZoomButton( { in: true, radius: magnifyingGlassRadius } );
        const zoomButtons = new Node( { children: [ zoomOutButton, zoomInButton ] } );
        zoomInButton.left = zoomOutButton.right + 25;
        zoomInButton.centerY = zoomOutButton.centerY;
        // expand touch area
        zoomOutButton.touchArea = zoomOutButton.localBounds.dilated( 5, 5 );
        zoomInButton.touchArea = zoomOutButton.localBounds.dilated( 5, 5 );

        // scale switch (Logarithmic vs Linear)
        const textOptions = {
          font: AB_SWITCH_FONT,
          maxWidth: 125
        };
        const graphScaleSwitch = new ABSwitch( this.graphScaleProperty,
          GraphScale.LOGARITHMIC, new Text( logarithmicString, textOptions ),
          GraphScale.LINEAR, new Text( linearString, textOptions ),
          { size: new Dimension2( 50, 25 ), centerOnButton: true } );

        // vertical line that connects bottom of graph to top of scale switch
        const lineToSwitchNode = new Line( 0, 0, 0, 200, { stroke: 'black ' } );

        // rendering order
        graphNode.addChild( lineToSwitchNode );
        lineToSwitchNode.moveToBack();
        graphNode.addChild( linearGraph );
        graphNode.addChild( zoomButtons );
        graphNode.addChild( graphScaleSwitch );

        // layout
        const ySpacing = 15;
        linearGraph.centerX = logarithmicGraph.centerX;
        linearGraph.y = logarithmicGraph.y; // y, not top
        zoomButtons.centerX = logarithmicGraph.centerX;
        zoomButtons.top = linearGraph.y + options.linearScaleHeight + ( 3 * ySpacing );
        graphScaleSwitch.centerX = lineToSwitchNode.centerX;
        graphScaleSwitch.top = zoomButtons.bottom + ySpacing;
        lineToSwitchNode.centerX = lineToBarNode.centerX;
        lineToSwitchNode.bottom = graphScaleSwitch.top + 1;

        // handle scale changes
        this.graphScaleProperty.link( graphScale => {
          logarithmicGraph.visible = ( graphScale === GraphScale.LOGARITHMIC );
          linearGraph.visible = zoomButtons.visible = ( graphScale === GraphScale.LINEAR );
        } );

        // enable/disable zoom buttons
        this.exponentProperty.link( exponent => {
          assert && assert( exponentRange.contains( exponent ) );
          zoomInButton.enabled = ( exponent > exponentRange.min );
          zoomOutButton.enabled = ( exponent < exponentRange.max );
        } );

        // handle zoom of linear graph
        zoomInButton.addListener( () => {
          this.exponentProperty.set( this.exponentProperty.get() - 1 );
        } );
        zoomOutButton.addListener( () => {
          this.exponentProperty.set( this.exponentProperty.get() + 1 );
        } );
      }
    }

    /**
     * @public
     */
    reset() {
      this.graphUnitsProperty.reset();
      this.exponentProperty.reset();
      this.graphScaleProperty.reset();
    }
  }

  return phScale.register( 'GraphNode', GraphNode );
} );
