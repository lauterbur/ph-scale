// Copyright 2013-2017, University of Colorado Boulder

/**
 * OH- (hydroxide) molecule.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var HydrogenNode = require( 'PH_SCALE/common/view/molecules/HydrogenNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var OxygenNode = require( 'PH_SCALE/common/view/molecules/OxygenNode' );
  var phScale = require( 'PH_SCALE/phScale' );

  /**
   * @param {Object} options
   * @constructor
   */
  function OHNode( options ) {

    Node.call( this );

    // atoms
    var oxygen = new OxygenNode();
    var hydrogen = new HydrogenNode();

    // rendering order
    this.addChild( oxygen );
    this.addChild( hydrogen );

    // layout
    hydrogen.left = oxygen.right - ( 0.2 * oxygen.width );
    hydrogen.centerY = oxygen.centerY - ( 0.1 * oxygen.height );

    this.mutate( options );
  }

  phScale.register( 'OHNode', OHNode );

  return inherit( Node, OHNode );
} );
