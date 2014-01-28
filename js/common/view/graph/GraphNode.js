// Copyright 2002-2013, University of Colorado Boulder

/**
 * Container for all components related to the graph feature.
 * It has an expand/collapse bar at the top of it, and can switch between 'concentration' and 'quantity'.
 * Interactivity and linear scale are optional.
 * Origin is at top-level of the expand/collapse bar.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var ABSwitch = require( 'SUN/ABSwitch' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var ExpandCollapseBar = require( 'SUN/ExpandCollapseBar' );
  var GraphScale = require( 'PH_SCALE/common/view/graph/GraphScale' );
  var GraphUnits = require( 'PH_SCALE/common/view/graph/GraphUnits' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var LinearGraph = require( 'PH_SCALE/common/view/graph/LinearGraph' );
  var LogarithmicGraph = require( 'PH_SCALE/common/view/graph/LogarithmicGraph' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PHScaleColors = require( 'PH_SCALE/common/PHScaleColors' );
  var PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ZoomButton = require( 'PH_SCALE/common/view/graph/ZoomButton' );

  // strings
  var concentrationString = require( 'string!PH_SCALE/concentration' );
  var linearString = require( 'string!PH_SCALE/linear' );
  var logarithmicString = require( 'string!PH_SCALE/logarithmic' );
  var molesString = require( 'string!PH_SCALE/units.moles' );
  var molesPerLiterString = require( 'string!PH_SCALE/units.molesPerLiter' );
  var quantityString = require( 'string!PH_SCALE/quantity' );

  /**
   * @param {Solution} solution
   * @param {*} options
   * @constructor
   */
  function GraphNode( solution, options ) {

    options = _.extend( {
      isInteractive: false, // only the Log scale can be interactive
      scaleHeight: 100,
      expanded: true,
      hasLinearFeature: false,
      units: GraphUnits.MOLES_PER_LITER,
      graphScale: GraphScale.LOGARITHMIC
    }, options );

    var thisNode = this;
    Node.call( thisNode );

    var textOptions = { font: new PhetFont( { size: 18, weight: 'bold' } ) };

    // units switch
    var graphUnitsProperty = new Property( options.units );
    var graphUnitsSwitch = new ABSwitch( graphUnitsProperty,
      GraphUnits.MOLES_PER_LITER, new MultiLineText( concentrationString + '\n(' + molesPerLiterString + ')', textOptions ),
      GraphUnits.MOLES, new MultiLineText( quantityString + '\n(' + molesString + ')', textOptions ),
      { size: new Dimension2( 50, 25 ) } );
    graphUnitsSwitch.setScaleMagnitude( Math.min( 1, 300 / graphUnitsSwitch.width ) ); // scale for i18n

    // expand/collapse bar
    var expandedProperty = new Property( options.expanded );
    var expandCollapseBar = new ExpandCollapseBar(
      graphUnitsSwitch,
      expandedProperty, {
        minWidth: 350,
        barFill: PHScaleColors.PANEL_FILL,
        barLineWidth: 2,
        buttonLength: PHScaleConstants.EXPAND_COLLAPSE_BUTTON_LENGTH
      } );

    // logarithmic graph
    var logarithmicGraph = new LogarithmicGraph( solution, graphUnitsProperty, {
      scaleHeight: options.scaleHeight,
      isInteractive: options.isInteractive
    } );

    // vertical line that connects bottom of expand/collapse bar to top of graph
    var lineToBarNode = new Line( 0, 0, 0, 200, { stroke: 'black' } );

    // rendering order
    thisNode.addChild( expandCollapseBar );
    var graphNode = new Node();
    thisNode.addChild( graphNode );
    graphNode.addChild( lineToBarNode );
    graphNode.addChild( logarithmicGraph );

    // layout
    logarithmicGraph.centerX = lineToBarNode.centerX;
    logarithmicGraph.y = 30; // y, not top
    graphNode.centerX = expandCollapseBar.centerX;
    graphNode.y = expandCollapseBar.bottom; // y, not top

    // expand/collapse the graph
    expandedProperty.link( function( expanded ) {
      graphNode.visible = expanded;
    } );

    // optional linear graph
    if ( options.hasLinearFeature ) {

      var mantissaRange = PHScaleConstants.LINEAR_MANTISSA_RANGE;
      var exponentRange = PHScaleConstants.LINEAR_EXPONENT_RANGE;
      var exponentProperty = new Property( exponentRange.max );
      var linearGraph = new LinearGraph( solution, graphUnitsProperty, mantissaRange, exponentRange, exponentProperty, {
        arrowHeight: 60,
        scaleHeight: options.scaleHeight
      } );

      // zoom buttons for the linear graph
      var magnifyingGlassRadius = 10;
      var zoomInButton = new ZoomButton( { in: true, radius: magnifyingGlassRadius } );
      var zoomOutButton = new ZoomButton( { in: false, radius: magnifyingGlassRadius } );
      var zoomButtons = new Node( { children: [ zoomInButton, zoomOutButton ]} );
      zoomOutButton.left = zoomInButton.right + 10;
      zoomOutButton.centerY = zoomInButton.centerY;

      // switch between 'Logarithmic' and 'Linear'
      var graphScaleProperty = new Property( options.graphScale );
      var graphScaleSwitch = new ABSwitch( graphScaleProperty,
        GraphScale.LOGARITHMIC, new Text( logarithmicString, textOptions ),
        GraphScale.LINEAR, new Text( linearString, textOptions ),
        { size: new Dimension2( 50, 25 ), centerOnButton: true } );

      // vertical line that connects bottom of graph to top of scale switch
      var ySpacing = 15;
      var lineToSwitchNode = new Line( 0, 0, 0, zoomButtons.height + ( 2 * ySpacing ), { stroke: 'black ' } );

      // rendering order
      graphNode.addChild( lineToSwitchNode );
      lineToSwitchNode.moveToBack();
      graphNode.addChild( linearGraph );
      graphNode.addChild( zoomButtons );
      graphNode.addChild( graphScaleSwitch );

      // layout
      linearGraph.centerX = logarithmicGraph.centerX;
      linearGraph.y = logarithmicGraph.y; // y, not top
      lineToSwitchNode.centerX = lineToBarNode.centerX;
      lineToSwitchNode.top = logarithmicGraph.y + options.scaleHeight - 1;
      graphScaleSwitch.centerX = lineToSwitchNode.centerX;
      graphScaleSwitch.top = lineToSwitchNode.bottom - 1;
      zoomButtons.centerX = logarithmicGraph.centerX;
      zoomButtons.centerY = lineToSwitchNode.centerY;

      // handle scale changes
      graphScaleProperty.link( function( graphScale ) {
        logarithmicGraph.visible = ( graphScale === GraphScale.LOGARITHMIC );
        linearGraph.visible = zoomButtons.visible = ( graphScale === GraphScale.LINEAR );
      } );

      // enable/disable zoom buttons
      exponentProperty.link( function( exponent ) {
        assert && assert( exponentRange.contains( exponent ) );
        zoomInButton.enabled = ( exponent > exponentRange.min );
        zoomOutButton.enabled = ( exponent < exponentRange.max );
      });

      // handle zoom of linear graph
      zoomInButton.addListener( function() {
        exponentProperty.set( exponentProperty.get() - 1 );
      } );
      zoomOutButton.addListener( function() {
        exponentProperty.set( exponentProperty.get() + 1 );
      } );
    }
  }

  return inherit( Node, GraphNode );
} );