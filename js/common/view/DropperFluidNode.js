// Copyright 2002-2013, University of Colorado Boulder

/**
 * Fluid (stock solution) coming out of the dropper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {Dropper} dropper
   * @param {Beaker} beaker
   * @param {Number} tipWidth
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function DropperFluidNode( dropper, beaker, tipWidth, mvt ) {

    var thisNode = this;

    Rectangle.call( thisNode, 0, 0, 0, 0, { lineWidth: 1 } );

    // shape and location
    var updateShapeAndLocation = function() {
      // path
      if ( dropper.onProperty.get() && !dropper.emptyProperty.get() ) {
        thisNode.setRect( -tipWidth / 2, 0, tipWidth, beaker.location.y - dropper.locationProperty.get().y );
      }
      else {
        thisNode.setRect( 0, 0, 0, 0 );
      }
      // move this node to the dropper's location
      thisNode.translation = mvt.modelToViewPosition( dropper.locationProperty.get() );
    };
    dropper.locationProperty.link( updateShapeAndLocation );
    dropper.onProperty.link( updateShapeAndLocation );
    dropper.emptyProperty.link( updateShapeAndLocation );

    // set color to match solute
    dropper.soluteProperty.link( function( solute ) {
      var soluteColor = solute.colorProperty.get();
      thisNode.fill = soluteColor;
      thisNode.stroke = soluteColor.darkerColor();
    } );

    // hide this node when the dropper is invisible
    dropper.visibleProperty.link( function( visible ) {
      thisNode.setVisible( visible );
    } );
  }

  return inherit( Rectangle, DropperFluidNode );
} );