// Copyright 2013-2020, University of Colorado Boulder

/**
 * Oxygen atom.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import Color from '../../../../../scenery/js/util/Color.js';
import phScale from '../../../phScale.js';
import PHScaleColors from '../../PHScaleColors.js';

class OxygenNode extends ShadedSphereNode {

  constructor() {
    super( 30, {
      mainColor: PHScaleColors.OXYGEN,
      highlightColor: new Color( 255, 255, 255 )
    } );
  }
}

phScale.register( 'OxygenNode', OxygenNode );
export default OxygenNode;