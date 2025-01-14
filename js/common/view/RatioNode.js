// Copyright 2013-2020, University of Colorado Boulder

/**
 * Visual representation of H3O+/OH- ratio.
 *
 * Molecules are drawn as flat circles, directly to Canvas for performance.
 * In the pH range is close to neutral, the relationship between number of molecules and pH is log.
 * Outside of that range, we can't possibly draw that many molecules, so we fake it using a linear relationship.
 *
 * Note: The implementation refers to 'majority' or 'minority' species throughout.
 * This is a fancy was of saying 'the molecule that has the larger (or smaller) count'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import phScale from '../../phScale.js';
import PHModel from '../model/PHModel.js';
import PHScaleColors from '../PHScaleColors.js';
import PHScaleConstants from '../PHScaleConstants.js';
import PHScaleQueryParameters from '../PHScaleQueryParameters.js';

// constants
const TOTAL_MOLECULES_AT_PH_7 = 100;
const MAX_MAJORITY_MOLECULES = 3000;
const MIN_MINORITY_MOLECULES = 5; // any non-zero number of particles will be set to this number
const LOG_PH_RANGE = new Range( 6, 8 ); // in this range, number of molecule is computed using log

const H3O_RADIUS = 3;
const OH_RADIUS = H3O_RADIUS;

const MAJORITY_ALPHA = 0.55; // alpha of the majority species, [0-1], transparent-opaque
const MINORITY_ALPHA = 1.0; // alpha of the minority species, [0-1], transparent-opaque
const H3O_STROKE = 'black'; // optional stroke around H3O+ molecules
const H3O_LINE_WIDTH = 0.25; // width of stroke around H3O+ molecules, ignored if H3O_STROKE is null
const OH_STROKE = 'black'; // optional stroke around OH- molecules
const OH_LINE_WIDTH = 0.25; // width of stroke around OH- molecules, ignored if OH_STROKE is null

class RatioNode extends Node {

  /**
   * @param {Beaker} beaker
   * @param {MicroSolution|MySolution} solution
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( beaker, solution, modelViewTransform, options ) {

    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    super();

    // @private save constructor args
    this.solution = solution;

    // @private current pH, null to force an update
    this.pH = null;

    // bounds of the beaker, in view coordinates
    const beakerBounds = modelViewTransform.modelToViewBounds( beaker.bounds );

    // @private parent for all molecules
    this.moleculesNode = new MoleculesCanvas( beakerBounds );
    this.addChild( this.moleculesNode );

    // Show the ratio of molecules
    if ( PHScaleQueryParameters.showRatio ) {

      // @private
      this.ratioText = new Text( '?', {
        font: new PhetFont( 30 ),
        fill: 'black'
      } );
      this.addChild( this.ratioText );
    }

    // call before registering for Property notifications, because 'visible' significantly affects initialization time
    this.mutate( options );

    // sync view with model
    solution.pHProperty.link( this.update.bind( this ) );

    // This Property was added for PhET-iO, to show the actual H3O+/OH- ratio of the solution. It is not used
    // elsewhere, hence the eslint-disable comment below. See https://github.com/phetsims/ph-scale/issues/112
    // eslint-disable-next-line no-new
    new DerivedProperty( [ solution.pHProperty ],
      pH => {
        if ( pH === null ) {
          return null;
        }
        else {
          return PHModel.pHToConcentrationH3O( pH ) / PHModel.pHToConcentrationOH( pH );
        }
      }, {
        tandem: options.tandem.createTandem( 'ratioProperty' ),
        phetioType: DerivedProperty.DerivedPropertyIO( NullableIO( NumberIO ) ),
        phetioDocumentation: 'the H<sub>3</sub>O<sup>+</sup>/OH<sup>-</sup> ratio of the solution in the beaker, null if the beaker is empty',
        phetioHighFrequency: true
      } );

    // clip to the shape of the solution in the beaker
    solution.totalVolumeProperty.link( totalVolume => {
      if ( totalVolume === 0 ) {
        this.clipArea = null;
      }
      else {
        const solutionHeight = beakerBounds.getHeight() * totalVolume / beaker.volume;
        this.clipArea = Shape.rectangle( beakerBounds.minX, beakerBounds.maxY - solutionHeight, beakerBounds.getWidth(), solutionHeight );
      }
      this.moleculesNode.invalidatePaint(); //WORKAROUND: #25, scenery#200
    } );

    // Update this Node when it becomes visible.
    this.visibleProperty.link( visible => visible && this.update() );

    // @private
    this.beakerBounds = beakerBounds;
  }

  /**
   * Updates the number of molecules when the pH (as displayed on the meter) changes.
   * If total volume changes, we don't create more molecules, we just expose more of them.
   * @private
   */
  update() {

    // don't update if not visible
    if ( !this.visible ) { return; }

    let pH = this.solution.pHProperty.get();
    if ( pH !== null ) {
      pH = Utils.toFixedNumber( this.solution.pHProperty.get(), PHScaleConstants.PH_METER_DECIMAL_PLACES );
    }

    if ( this.pH !== pH ) {

      this.pH = pH;
      let numberOfH3O = 0;
      let numberOfOH = 0;

      if ( pH !== null ) {

        // compute number of molecules
        if ( LOG_PH_RANGE.contains( pH ) ) {

          // # molecules varies logarithmically in this range
          numberOfH3O = Math.max( MIN_MINORITY_MOLECULES, computeNumberOfH3O( pH ) );
          numberOfOH = Math.max( MIN_MINORITY_MOLECULES, computeNumberOfOH( pH ) );
        }
        else {

          // # molecules varies linearly in this range
          // N is the number of molecules to add for each 1 unit of pH above or below the thresholds
          const N = ( MAX_MAJORITY_MOLECULES - computeNumberOfOH( LOG_PH_RANGE.max ) ) / ( PHScaleConstants.PH_RANGE.max - LOG_PH_RANGE.max );
          let pHDiff;
          if ( pH > LOG_PH_RANGE.max ) {

            // strong base
            pHDiff = pH - LOG_PH_RANGE.max;
            numberOfH3O = Math.max( MIN_MINORITY_MOLECULES, ( computeNumberOfH3O( LOG_PH_RANGE.max ) - pHDiff ) );
            numberOfOH = computeNumberOfOH( LOG_PH_RANGE.max ) + ( pHDiff * N );
          }
          else {

            // strong acid
            pHDiff = LOG_PH_RANGE.min - pH;
            numberOfH3O = computeNumberOfH3O( LOG_PH_RANGE.min ) + ( pHDiff * N );
            numberOfOH = Math.max( MIN_MINORITY_MOLECULES, ( computeNumberOfOH( LOG_PH_RANGE.min ) - pHDiff ) );
          }
        }

        // convert to integer values
        numberOfH3O = Utils.roundSymmetric( numberOfH3O );
        numberOfOH = Utils.roundSymmetric( numberOfOH );
      }

      // update molecules
      this.moleculesNode.setNumberOfMolecules( numberOfH3O, numberOfOH );

      // update ratio counts
      if ( this.ratioText ) {
        this.ratioText.text = `${numberOfH3O} / ${numberOfOH}`;
        this.ratioText.centerX = this.beakerBounds.centerX;
        this.ratioText.bottom = this.beakerBounds.maxY - 20;
      }
    }
  }
}

phScale.register( 'RatioNode', RatioNode );

//-------------------------------------------------------------------------------------

// Creates a random {number} x-coordinate inside some {Bounds2} bounds. Integer values improve Canvas performance.
function createRandomX( bounds ) {
  return dotRandom.nextIntBetween( bounds.minX, bounds.maxX );
}

// Creates a random {number} y-coordinate inside some {Bounds2} bounds. Integer values improve Canvas performance.
function createRandomY( bounds ) {
  return dotRandom.nextIntBetween( bounds.minY, bounds.maxY );
}

// Computes the {number} number of H3O+ molecules for some {number} pH.
function computeNumberOfH3O( pH ) {
  return Utils.roundSymmetric( PHModel.pHToConcentrationH3O( pH ) * ( TOTAL_MOLECULES_AT_PH_7 / 2 ) / 1E-7 );
}

// Computes the {number} number of OH- molecules for some {number} pH.
function computeNumberOfOH( pH ) {
  return Utils.roundSymmetric( PHModel.pHToConcentrationOH( pH ) * ( TOTAL_MOLECULES_AT_PH_7 / 2 ) / 1E-7 );
}

//-------------------------------------------------------------------------------------

/**
 * Draws all molecules directly to Canvas.
 */
class MoleculesCanvas extends CanvasNode {

  /**
   * @param {Bounds2} beakerBounds - beaker bounds in view coordinate frame
   */
  constructor( beakerBounds ) {

    super( { canvasBounds: beakerBounds } );

    // @private
    this.beakerBounds = beakerBounds;
    this.numberOfH3OMolecules = 0;
    this.numberOfOHMolecules = 0;

    // use typed array if available, it will use less memory and be faster
    const ArrayConstructor = window.Float32Array || window.Array;

    // @private pre-allocate arrays for molecule x and y coordinates, to eliminate allocation in critical code
    this.xH3O = new ArrayConstructor( MAX_MAJORITY_MOLECULES );
    this.yH3O = new ArrayConstructor( MAX_MAJORITY_MOLECULES );
    this.xOH = new ArrayConstructor( MAX_MAJORITY_MOLECULES );
    this.yOH = new ArrayConstructor( MAX_MAJORITY_MOLECULES );

    // @private Generate majority and minority {HTMLCanvasElement} for each molecule.
    new Circle( H3O_RADIUS, {
      fill: PHScaleColors.H3O_MOLECULES.withAlpha( MAJORITY_ALPHA ),
      stroke: H3O_STROKE,
      lineWidth: H3O_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageH3OMajority = canvas; // @private {HTMLCanvasElement}
      } );

    new Circle( H3O_RADIUS, {
      fill: PHScaleColors.H3O_MOLECULES.withAlpha( MINORITY_ALPHA ),
      stroke: H3O_STROKE,
      lineWidth: H3O_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageH3OMinority = canvas; // @private {HTMLCanvasElement}
      } );

    new Circle( OH_RADIUS, {
      fill: PHScaleColors.OH_MOLECULES.withAlpha( MAJORITY_ALPHA ),
      stroke: OH_STROKE,
      lineWidth: OH_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageOHMajority = canvas; // @private {HTMLCanvasElement}
      } );

    new Circle( OH_RADIUS, {
      fill: PHScaleColors.OH_MOLECULES.withAlpha( MINORITY_ALPHA ),
      stroke: OH_STROKE,
      lineWidth: OH_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageOHMinority = canvas; // @private {HTMLCanvasElement}
      } );
  }

  /**
   * Sets the number of molecules to display. Called when the solution's pH changes.
   * @param {number} numberOfH3OMolecules
   * @param {number} numberOfOHMolecules
   * @public
   */
  setNumberOfMolecules( numberOfH3OMolecules, numberOfOHMolecules ) {
    if ( numberOfH3OMolecules !== this.numberOfH3OMolecules || numberOfOHMolecules !== this.numberOfOHMolecules ) {

      /*
       * paintCanvas may be called when other things in beakerBounds change,
       * and we don't want the molecule positions to change when the pH remains constant.
       * So generate and store molecule coordinates here, reusing the arrays.
       * See https://github.com/phetsims/ph-scale/issues/25
       */
      let i;
      for ( i = 0; i < numberOfH3OMolecules; i++ ) {
        this.xH3O[ i ] = createRandomX( this.beakerBounds );
        this.yH3O[ i ] = createRandomY( this.beakerBounds );
      }
      for ( i = 0; i < numberOfOHMolecules; i++ ) {
        this.xOH[ i ] = createRandomX( this.beakerBounds );
        this.yOH[ i ] = createRandomY( this.beakerBounds );
      }

      // remember how many entries in coordinate arrays are significant
      this.numberOfH3OMolecules = numberOfH3OMolecules;
      this.numberOfOHMolecules = numberOfOHMolecules;

      this.invalidatePaint(); // results in paintCanvas being called
    }
  }

  /**
   * Paints molecules to the Canvas.
   * @param {CanvasRenderingContext2D} context
   * @protected
   * @override
   */
  paintCanvas( context ) {

    // draw majority species behind minority species
    if ( this.numberOfH3OMolecules > this.numberOfOHMolecules ) {
      this.drawMolecules( context, this.imageH3OMajority, this.numberOfH3OMolecules, this.xH3O, this.yH3O );
      this.drawMolecules( context, this.imageOHMinority, this.numberOfOHMolecules, this.xOH, this.yOH );
    }
    else {
      this.drawMolecules( context, this.imageOHMajority, this.numberOfOHMolecules, this.xOH, this.yOH );
      this.drawMolecules( context, this.imageH3OMinority, this.numberOfH3OMolecules, this.xH3O, this.yH3O );
    }
  }

  /**
   * Draws one species of molecule. Using drawImage is faster than arc.
   * @param {CanvasRenderingContext2D} context
   * @param {HTMLCanvasElement} image
   * @param {number} numberOfMolecules
   * @param {number[]} xCoordinates
   * @param {number[]} yCoordinates
   * @private
   */
  drawMolecules( context, image, numberOfMolecules, xCoordinates, yCoordinates ) {

    // images are generated asynchronously, so test just in case they aren't available when this is first called
    if ( image ) {
      for ( let i = 0; i < numberOfMolecules; i++ ) {
        context.drawImage( image, xCoordinates[ i ], yCoordinates[ i ] );
      }
    }
  }
}

export default RatioNode;