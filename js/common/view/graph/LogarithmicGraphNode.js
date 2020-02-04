// Copyright 2013-2020, University of Colorado Boulder

//TODO #92 visibility of this should be controlled via GraphNode.graphScaleProperty
//TODO #92 instrument subcomponents?
/**
 * Graph with a logarithmic scale, for displaying concentration (mol/L) and quantity (moles).
 * Assumes that graphing concentration and quantity can be graphed on the same scale.
 * Origin is at the top-left of the scale rectangle.
 *
 * Some of the code related to indicators (initialization and updateIndicators) is similar
 * to LinearGraph. But it was difficult to identify a natural pattern for factoring
 * this out, so I chose to leave it as is. See issue #16.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const GraphIndicatorDragHandler = require( 'PH_SCALE/common/view/graph/GraphIndicatorDragHandler' );
  const GraphIndicatorNode = require( 'PH_SCALE/common/view/graph/GraphIndicatorNode' );
  const GraphUnits = require( 'PH_SCALE/common/view/graph/GraphUnits' );
  const Line = require( 'SCENERY/nodes/Line' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PHModel = require( 'PH_SCALE/common/model/PHModel' );
  const phScale = require( 'PH_SCALE/phScale' );
  const PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Utils = require( 'DOT/Utils' );

  class LogarithmicGraphNode extends Node {

    /**
     * @param {Solution} solution
     * @param {EnumerationProperty.<GraphUnits>} graphUnitsProperty
     * @param {Object} [options]
     */
    constructor( solution, graphUnitsProperty, options ) {

      options = merge( {
        isInteractive: false,

        // scale
        scaleHeight: 100,
        minScaleWidth: 100,
        scaleYMargin: 30, // space above/below top/bottom tick marks
        scaleCornerRadius: 20,
        scaleStroke: 'black',
        scaleLineWidth: 2,

        // major ticks
        majorTickFont: new PhetFont( 22 ),
        majorTickLength: 15,
        majorTickStroke: 'black',
        majorTickLineWidth: 1,
        majorTickXSpacing: 5,

        // minor ticks
        minorTickLength: 7,
        minorTickStroke: 'black',
        minorTickLineWidth: 1,

        // indicators
        indicatorXOffset: 10,

        // phet-io
        tandem: Tandem.REQUIRED
      }, options );

      super();

      // background for the scale, width sized to fit
      const widestTickLabel = createTickLabel( PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min, options.majorTickFont );
      const scaleWidth = Math.max( options.minScaleWidth, widestTickLabel.width + ( 2 * options.majorTickXSpacing ) + ( 2 * options.majorTickLength ) );
      const backgroundNode = new Rectangle( 0, 0, scaleWidth, options.scaleHeight, options.scaleCornerRadius, options.scaleCornerRadius, {
        fill: new LinearGradient( 0, 0, 0, options.scaleHeight ).addColorStop( 0, 'rgb( 200, 200, 200 )' ).addColorStop( 1, 'white' ),
        stroke: options.scaleStroke,
        lineWidth: options.scaleLineWidth
      } );
      this.addChild( backgroundNode );

      // tick marks
      const numberOfTicks = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.getLength() + 1;
      const ySpacing = ( options.scaleHeight - ( 2 * options.scaleYMargin ) ) / ( numberOfTicks - 1 ); // vertical space between ticks
      let exponent;
      let tickLabel;
      let tickLineLeft;
      let tickLineRight;
      for ( let i = 0; i < numberOfTicks; i++ ) {

        exponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max - i;

        // major ticks at even-numbered exponents
        if ( exponent % 2 === 0 ) {

          // major lines and label
          tickLineLeft = new Line( 0, 0, options.majorTickLength, 0, {
            stroke: options.majorTickStroke,
            lineWidth: options.majorTickLineWidth
          } );
          tickLineRight = new Line( 0, 0, options.majorTickLength, 0, {
            stroke: options.majorTickStroke,
            lineWidth: options.majorTickLineWidth
          } );
          tickLabel = createTickLabel( exponent, options.majorTickFont );

          // rendering order
          this.addChild( tickLineLeft );
          this.addChild( tickLineRight );
          this.addChild( tickLabel );

          // layout
          tickLineLeft.left = backgroundNode.left;
          tickLineLeft.centerY = options.scaleYMargin + ( i * ySpacing );
          tickLineRight.right = backgroundNode.right;
          tickLineRight.centerY = tickLineLeft.centerY;
          tickLabel.centerX = backgroundNode.centerX;
          tickLabel.centerY = tickLineLeft.centerY;
        }
        else {
          // minor lines
          tickLineLeft = new Line( 0, 0, options.minorTickLength, 0, {
            stroke: options.minorTickStroke,
            lineWidth: options.minorTickLineWidth
          } );
          tickLineRight = new Line( 0, 0, options.minorTickLength, 0, {
            stroke: options.minorTickStroke,
            lineWidth: options.minorTickLineWidth
          } );

          // rendering order
          this.addChild( tickLineLeft );
          this.addChild( tickLineRight );

          // layout
          tickLineLeft.left = backgroundNode.left;
          tickLineLeft.centerY = options.scaleYMargin + ( i * ySpacing );
          tickLineRight.right = backgroundNode.right;
          tickLineRight.centerY = tickLineLeft.centerY;
        }
      }

      // indicators & associated properties
      const valueH2OProperty = new NumberProperty( 0 );
      const valueH3OProperty = new NumberProperty( 0 );
      const valueOHProperty = new NumberProperty( 0 );
      const indicatorH2ONode = GraphIndicatorNode.createH2OIndicator( valueH2OProperty, {
        x: backgroundNode.right - options.indicatorXOffset,
        tandem: options.tandem.createTandem( 'indicatorH2ONode' )
      } );
      const indicatorH3ONode = GraphIndicatorNode.createH3OIndicator( valueH3OProperty, {
        x: backgroundNode.left + options.indicatorXOffset,
        isInteractive: options.isInteractive,
        tandem: options.tandem.createTandem( 'indicatorH3ONode' )
      } );
      const indicatorOHNode = GraphIndicatorNode.createOHIndicator( valueOHProperty, {
        x: backgroundNode.right - options.indicatorXOffset,
        isInteractive: options.isInteractive,
        tandem: options.tandem.createTandem( 'indicatorOHNode' )
      } );
      this.addChild( indicatorH2ONode );
      this.addChild( indicatorH3ONode );
      this.addChild( indicatorOHNode );

      // Given a value, compute it's y position relative to the top of the scale.
      const valueToY = value => {
        if ( value === 0 ) {
          // below the bottom tick
          return options.scaleHeight - ( 0.5 * options.scaleYMargin );
        }
        else {
          // between the top and bottom tick
          const maxHeight = ( options.scaleHeight - 2 * options.scaleYMargin );
          const maxExponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max;
          const minExponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min;
          const valueExponent = Utils.log10( value );
          return options.scaleYMargin + maxHeight - ( maxHeight * ( valueExponent - minExponent ) / ( maxExponent - minExponent ) );
        }
      };

      // Given a y position relative to the top of the scale, compute a value.
      const yToValue = y => {
        const yOffset = y - options.scaleYMargin; // distance between indicator's origin and top tick mark
        const maxHeight = ( options.scaleHeight - 2 * options.scaleYMargin ); // distance between top and bottom tick marks
        const exponent = Utils.linear( 0, maxHeight, PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max, PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min, yOffset );
        return Math.pow( 10, exponent );
      };

      // Update the indicators
      const updateIndicators = () => {

        let valueH2O;
        let valueH3O;
        let valueOH;
        if ( graphUnitsProperty.get() === GraphUnits.MOLES_PER_LITER ) {
          // concentration
          valueH2O = solution.getConcentrationH2O();
          valueH3O = solution.getConcentrationH3O();
          valueOH = solution.getConcentrationOH();
        }
        else {
          // quantity
          valueH2O = solution.getMolesH2O();
          valueH3O = solution.getMolesH3O();
          valueOH = solution.getMolesOH();
        }

        // move indicators
        indicatorH2ONode.y = valueToY( valueH2O );
        indicatorH3ONode.y = valueToY( valueH3O );
        indicatorOHNode.y = valueToY( valueOH );

        // update indicator values
        valueH2OProperty.set( valueH2O );
        valueH3OProperty.set( valueH3O );
        valueOHProperty.set( valueOH );
      };
      solution.pHProperty.link( updateIndicators.bind( this ) );
      solution.volumeProperty.link( updateIndicators.bind( this ) );
      graphUnitsProperty.link( updateIndicators.bind( this ) );

      // Add optional interactivity
      if ( options.isInteractive ) {

        // H3O+ indicator
        indicatorH3ONode.addInputListener(
          new GraphIndicatorDragHandler( solution, graphUnitsProperty, yToValue,
            PHModel.concentrationH3OToPH, PHModel.molesH3OToPH,
            options.tandem.createTandem( 'indicatorH3ODragHandler' )
          ) );

        // OH- indicator
        indicatorOHNode.addInputListener(
          new GraphIndicatorDragHandler( solution, graphUnitsProperty, yToValue,
            PHModel.concentrationOHToPH, PHModel.molesOHToPH,
            options.tandem.createTandem( 'indicatorOHDragHandler' )
          ) );
      }

      this.mutate( options );
    }
  }

  /**
   * Creates a tick label, '10' to some exponent.
   * @param {number} exponent
   * @param {Font} font
   */
  function createTickLabel( exponent, font ) {
    return new RichText( '10<sup>' + exponent + '</sup>', {
      font: font,
      fill: 'black'
    } );
  }

  return phScale.register( 'LogarithmicGraphNode', LogarithmicGraphNode );
} );