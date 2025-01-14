// Copyright 2013-2020, University of Colorado Boulder

/**
 * A movable model element.
 * Semantics of units are determined by the client.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import phScale from '../../phScale.js';

class PHMovable {

  /**
   * @param {Vector2} position
   * @param {Bounds2} dragBounds optional, undefined if not provided
   * @param {Object} [options]
   */
  constructor( position, dragBounds, options ) {

    options = merge( {

      // options passed to positionProperty
      positionPropertyOptions: null,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    // @public
    this.positionProperty = new Vector2Property( position, merge( {}, options.positionPropertyOptions, {
      tandem: options.tandem.createTandem( 'positionProperty' )
    } ) );

    // @public
    this.dragBounds = dragBounds;
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
  }
}

phScale.register( 'PHMovable', PHMovable );
export default PHMovable;