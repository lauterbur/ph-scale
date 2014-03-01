// Copyright 2002-2014, University of Colorado Boulder

/**
 * Displays a number in scientific notation, M x 10^E, where M is the mantissa and E is the exponent (e.g. 2.34 x 10^-4).
 * To conserve memory, creates one set of scenery.Text nodes, modifies their text as needed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  /**
   * Value to display.
   * @param value
   * @param {*} options
   * @constructor
   */
  function ScientificNotationNode( value, options ) {

    options = _.extend( {
      fill: 'black',
      font: new PhetFont( 22 ),
      exponent: null,
      mantissaDecimalPlaces: 1,
      exponentScale: 0.75, // size of the exponent, relative to the '10', expressed as a percentage (100 is 'same size'), will be rounded to an integer
      zeroIsInteger: true, // if true, zero will be displayed as '0'
      showZeroExponent: false, // if true, show 'M x 10^0', otherwise show 'M'
      showOneMantissa: true, // if true, show '1 x 10^E', otherwise show '10^E'
      exponentXSpacing: 2, // space to left of exponent
      exponentYOffset: 5, // offset of exponent's center from top of 'x 10'
      nullValueString: '-' // if the value is null, display this string
    }, options );
    this.options = options; // @private

    // scenery.Text nodes
    var textOptions = { font: options.font, fill: options.fill };
    this.mantissaNode = new Text( '?', textOptions );
    this.timesTenNode = new Text( '?', textOptions );
    this.exponentNode = new Text( '?', _.extend( { scale: options.exponentScale }, textOptions ) ); // exponent is scaled
    this.exponentNode.centerY = this.timesTenNode.top + options.exponentYOffset;

    // compute width of space between mantissa and 'x 10'
    this.mantissaXSpacing = new Text( ' ', textOptions ).width;

    options.children = [ this.mantissaNode, this.exponentNode, this.timesTenNode ];
    Node.call( this, options );

    this.setValue( value );
  }

  return inherit( Node, ScientificNotationNode, {

    /**
     * Sets the value displayed by the node.
     * @param {Number} value
     * @param {*} options override options that were provided in the constructor
     */
    setValue: function( value, options ) {

      options = _.extend( this.options, options );

      // update text
      var scientificNotation = ScientificNotationNode.toScientificNotation( value, options );

      // start will all nodes included
      if ( !this.isChild( this.mantissaNode ) ) { this.addChild( this.mantissaNode ); }
      if ( !this.isChild( this.exponentNode ) ) { this.addChild( this.exponentNode ); }
      if ( !this.isChild( this.timesTenNode ) ) { this.addChild( this.timesTenNode ); }

      if ( value === null ) {
        // show '-'
        this.mantissaNode.text = options.nullValueString;
        this.removeChild( this.timesTenNode );
        this.removeChild( this.exponentNode );
      }
      else if ( scientificNotation.mantissa === 0 && options.zeroIsInteger ) {
        // show '0 x 10^E' as '0'
        this.mantissaNode.text = '0';
        this.removeChild( this.timesTenNode );
        this.removeChild( this.exponentNode );
      }
      else if ( scientificNotation.mantissa === 1 && !options.showOneMantissa ) {
        // show '1 x 10^E' as '10^E'
        this.removeChild( this.mantissaNode );
        this.timesTenNode.text = '10';
        this.exponentNode.text = scientificNotation.exponent;
      }
      else if (scientificNotation.exponent === 0 && !options.showZeroExponent ) {
        // show 'M x 10^0' as 'M'
        this.mantissaNode.text = Util.toFixed( scientificNotation.mantissa, options.mantissaDecimalPlaces );
        this.removeChild( this.timesTenNode );
        this.removeChild( this.exponentNode );
      }
      else {
        // show 'M x 10^E'
        this.mantissaNode.text = Util.toFixed( scientificNotation.mantissa, options.mantissaDecimalPlaces );
        this.timesTenNode.text = 'x 10';
        this.exponentNode.text = scientificNotation.exponent;
      }

      // update layout
      this.timesTenNode.left = this.mantissaNode.right + this.mantissaXSpacing;
      this.exponentNode.left = this.timesTenNode.right + options.exponentXSpacing;
    }
  }, {

    /*
     * Converts a number to scientific-notation format, consisting of a mantissa and exponent,
     * such that the values is equal to (mantissa * Math.pow(10, exponent)).]
     *
     * @static
     * @param {Number} value the number to be formatted
     * @param {*} options
     * @return {mantissa:{Number}, exponent:{Number}}
     */
    toScientificNotation: function( value, options ) {

      options = _.extend( {
        mantissaDecimalPlaces: 1,
        exponent: null // specific exponent to use
      }, options );

      var mantissa, exponent;
      if ( value === 0 ) {
        mantissa = 0;
        exponent = 1;
      }
      else if ( options.exponent !== null && options.exponent === 0 ) {
        mantissa = Util.toFixed( value, options.mantissaDecimalPlaces );
        exponent = 0;
      }
      else {
        // Convert to a string in exponential notation (eg 2e+2).
        // Request an additional decimal place, because toExponential uses toFixed, which doesn't round the same on all platforms.
        var exponentialString = value.toExponential( options.mantissaDecimalPlaces + 1 );

        // Break into mantissa and exponent tokens.
        var tokens = exponentialString.toLowerCase().split( 'e' );

        // Adjust the mantissa token to the correct number of decimal places, using nearest-neighbor rounding.
        var mantissaString = Util.toFixed( parseFloat( tokens[0] ), options.mantissaDecimalPlaces );
        var exponentString = tokens[1];

        // Convert if a specific exponent was requested.
        if ( options.exponent !== null ) {
          mantissaString = Util.toFixed(
            parseFloat( mantissaString ) * Math.pow( 10, parseInt( exponentString, 10 ) - options.exponent ),
            Math.max( 0, options.mantissaDecimalPlaces ) );
          exponentString = options.exponent.toString();
        }

        //TODO eliminate unnecessary conversions between string and number
        mantissa = parseFloat( mantissaString );
        exponent = parseInt( exponentString );
      }

      // mantissa x 10^exponent
      return { mantissa: mantissa, exponent: exponent };
    }
  } );
} );
