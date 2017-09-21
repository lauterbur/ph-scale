// Copyright 2013-2016, University of Colorado Boulder

/**
 * Solution that appears in the beaker.
 * Origin is at bottom center of beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var phScale = require( 'PH_SCALE/phScale' );
  var PHScaleConstants = require( 'PH_SCALE/common/PHScaleConstants' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Solution} solution
   * @param {Beaker} beaker
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function SolutionNode( solution, beaker, modelViewTransform ) {

    var self = this;

    Rectangle.call( this, 0, 0, 1, 1, { lineWidth: 1 } ); // size and color set dynamically

    /*
     * Updates the color of the solution, accounting for saturation.
     * @param {Color} color
     */
    solution.colorProperty.link( function( color ) {
      self.fill = color;
      self.stroke = color.darkerColor();
    } );

    /*
     * Updates the amount of stuff in the beaker, based on solution volume.
     * @param {number} volume
     */
    var viewLocation = modelViewTransform.modelToViewPosition( beaker.location );
    var viewWidth = modelViewTransform.modelToViewDeltaX( beaker.size.width );
    solution.volumeProperty.link( function( volume ) {
      assert && assert( volume >= 0 );

      // min non-zero volume, so that the solution is visible to the user and detectable by the concentration probe
      if ( volume !== 0 && volume < PHScaleConstants.MIN_SOLUTION_VOLUME ) {
        volume = PHScaleConstants.MIN_SOLUTION_VOLUME;
      }

      // determine dimensions in model coordinates
      var solutionHeight = Util.linear( 0, beaker.volume, 0, beaker.size.height, volume ); // volume -> height

      // convert to view coordinates and create shape
      var viewHeight = modelViewTransform.modelToViewDeltaY( solutionHeight );

      // shape
      self.setRect( viewLocation.x - (viewWidth / 2), viewLocation.y - viewHeight, viewWidth, viewHeight );
    } );
  }

  phScale.register( 'SolutionNode', SolutionNode );

  return inherit( Rectangle, SolutionNode );
} );