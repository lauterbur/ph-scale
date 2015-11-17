// Copyright 2013-2015, University of Colorado Boulder

/**
 * Hydrogen atom.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var phScale = require( 'PH_SCALE/phScale' );
  var PHScaleColors = require( 'PH_SCALE/common/PHScaleColors' );
  var ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );

  /**
   * @constructor
   */
  function HydrogenNode() {
    ShadedSphereNode.call( this, 15, {
      mainColor: PHScaleColors.HYDROGEN,
      highlightColor: new Color( 255, 255, 255 )
    } );
  }

  phScale.register( 'HydrogenNode', HydrogenNode );

  return inherit( ShadedSphereNode, HydrogenNode );
} );
