// Copyright 2013-2020, University of Colorado Boulder

/**
 * Solute model, with instances used by this sim.
 * Solutes are immutable, so all fields should be considered immutable.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import Color from '../../../../scenery/js/util/Color.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import phScale from '../../phScale.js';
import phScaleStrings from '../../phScaleStrings.js';
import PHScaleConstants from '../PHScaleConstants.js';
import Water from './Water.js';

class Solute extends PhetioObject {

  /**
   * @param {string} name - the name of the solute, displayed to the user
   * @param {number} pH - the pH of the solute
   * @param {Color} stockColor - color of the solute in stock solution (no dilution)
   * @param {Object} [options]
   */
  constructor( name, pH, stockColor, options ) {

    assert && assert( PHScaleConstants.PH_RANGE.contains( pH ), `invalid pH: ${pH}` );
    assert && assert( stockColor instanceof Color, 'invalid color' );

    options = merge( {

      // {Color} color when the solute is barely present in solution (fully diluted)
      dilutedColor: Water.color,

      // {Color|null} optional color used to smooth out some color transitions as the solute is diluted
      colorStopColor: null,

      // {number} dilution ratio at which colorStopColor will be applied, ignored if colorStop is null
      // (0,1) exclusive, where 0 is no solute, 1 is all solute
      colorStopRatio: 0.25,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: Solute.SoluteIO,
      phetioState: false
    }, options );

    super( options );

    assert && assert( options.dilutedColor instanceof Color, `invalid dilutedColor: ${options.dilutedColor}` );
    assert && assert( options.colorStopColor === null || options.colorStopColor instanceof Color, `invalid colorStopColor: ${options.colorStopColor}` );
    assert && assert( options.colorStopRatio > 0 && options.colorStopRatio < 1, `invalid colorStopRatio: ${options.colorStopRatio}` );

    // @public (read-only)
    // Name is a Property solely for PhET-iO. A use-case is when the client wants to replace the solute name with
    // something like '?' as part of an exercise where the student needs to guess a solute's identity.  This Property
    // should definitely not be used to make a solute look like some other solute, but there's nothing to prevent that
    // abuse. See https://github.com/phetsims/ph-scale/issues/110
    this.nameProperty = new StringProperty( name, {
      tandem: options.tandem.createTandem( 'nameProperty' ),
      phetioDocumentation: 'name of the solute, as displayed in the user interface'
    } );

    // @public (read-only)
    this.pH = pH;
    this.stockColor = stockColor;

    // @public (read-only) used to other make tandems that pertain to this solute, e.g. combo box items
    this.tandemName = options.tandem.name;

    // @private
    this.dilutedColor = options.dilutedColor;
    this.colorStopColor = options.colorStopColor;
    this.colorStopRatio = options.colorStopRatio;
  }

  /**
   * String representation of this Solute. For debugging only, do not depend on the format!
   * @returns {string}
   * @public
   */
  toString() {
    return `Solution[name:${this.name}, pH:${this.pH}]`;
  }

  /**
   * Gets the solute's name.
   * @returns {string}
   */
  get name() {
    return this.nameProperty.value;
  }

  /**
   * Computes the color for a dilution of this solute.
   * @param {number} ratio describes the dilution, range is [0,1] inclusive, 0 is no solute, 1 is all solute
   * @returns {Color}
   * @public
   */
  computeColor( ratio ) {
    assert && assert( ratio >= 0 && ratio <= 1 );
    let color;
    if ( this.colorStopColor ) {
      if ( ratio > this.colorStopRatio ) {
        color = Color.interpolateRGBA( this.colorStopColor, this.stockColor,
          ( ratio - this.colorStopRatio ) / ( 1 - this.colorStopRatio ) );
      }
      else {
        color = Color.interpolateRGBA( this.dilutedColor, this.colorStopColor,
          ratio / this.colorStopRatio );
      }
    }
    else {
      color = Color.interpolateRGBA( this.dilutedColor, this.stockColor, ratio );
    }
    return color;
  }
}

/**
 * SoluteIO handles PhET-iO serialization of Solute. Since all Solutes are static instances, it implements
 * 'Reference type serialization', as described in the Serialization section of
 * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
 * But because we want 'name' and 'pH' fields to appear in Studio, we cannot subclass ReferenceIO and must provide
 * both toStateObject and fromStateObject. See https://github.com/phetsims/ph-scale/issues/205.
 * @public
 */
Solute.SoluteIO = new IOType( 'SoluteIO', {
  valueType: Solute,
  supertype: ReferenceIO( IOType.ObjectIO ),
  toStateObject: solute => {

    const soluteReference = ReferenceIO( IOType.ObjectIO ).toStateObject( solute );
    soluteReference.name = solute.name;
    soluteReference.pH = solute.pH;
    return soluteReference;
  }
} );

// Static instances

// parent tandem for all static instances of Solute, which are used across all screens
const SOLUTES_TANDEM = Tandem.GLOBAL_MODEL.createTandem( 'solutes' );

Solute.NITRIC_ACID = new Solute( phScaleStrings.choice.nitricAcid, 1, new Color( 255, 255, 0 ), {
  colorStopColor: new Color( 255, 224, 204 ),
  tandem: SOLUTES_TANDEM.createTandem( 'nitricAcid' )
} );

Solute.SOAP = new Solute( phScaleStrings.choice.soap, 10, new Color( 224, 141, 242 ), {
  colorStopColor: new Color( 232, 204, 255 ),
  tandem: SOLUTES_TANDEM.createTandem( 'soap' )
} );

Solute.AMMONIUM = new Solute( phScaleStrings.choice.ammonium, 11, new Color( 250, 250, 250 ), {
  tandem: SOLUTES_TANDEM.createTandem( 'ammonium' )
} );

Solute.PHOSPHORIC_ACID = new Solute( phScaleStrings.choice.phosphoricAcid, 2, new Color( 250, 250, 250 ), {
  tandem: SOLUTES_TANDEM.createTandem( 'phosphoricAcid' )
} );

Solute.SULFURIC_ACID = new Solute( phScaleStrings.choice.sulfuricAcid, 3, new Color( 250, 250, 250 ), {
  tandem: SOLUTES_TANDEM.createTandem( 'sulfuricAcid' )
} );

Solute.LIME = new Solute( phScaleStrings.choice.lime, 12.4, new Color( 250, 250, 250 ), {
  tandem: SOLUTES_TANDEM.createTandem( 'lime' )
} );

Solute.SALT_WATER = new Solute( phScaleStrings.choice.saltWater, 7, new Color( 250, 250, 250 ), {
  tandem: SOLUTES_TANDEM.createTandem( 'saltWater' )
} );

Solute.POTASSIUM_SULFATE = new Solute( phScaleStrings.choice.potassiumSulfate, 6, new Color( 59, 240, 234 ), {
  colorStopColor: new Color( 183, 229, 227 ),
  tandem: SOLUTES_TANDEM.createTandem( 'potassiumSulfate' )
} );

Solute.BATTERY_ACID = new Solute( phScaleStrings.choice.batteryAcid, 1, new Color( 255, 171, 120 ), {
  colorStopColor: new Color( 255, 224, 204 ),
  tandem: SOLUTES_TANDEM.createTandem( 'batteryAcid' )
} );

Solute.WATER = new Solute( Water.name, Water.pH, Water.color, {
  tandem: SOLUTES_TANDEM.createTandem( 'water' )
} );

phScale.register( 'Solute', Solute );
export default Solute;
