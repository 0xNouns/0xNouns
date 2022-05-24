import classes from './DynamicQuorumInfoModal.module.css';
import ReactDOM from 'react-dom';
import React from 'react';
import { XIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Proposal } from '../../wrappers/nounsDao';
import clsx from 'clsx';
import { min } from 'ramda';
import { ChartBounds, makeSmoothSVGChart } from '../../utils/svgChartingUtilts';
import { pointsPositionsCalc } from "../../utils/svgChartingUtilts";

export const Backdrop: React.FC<{ onDismiss: () => void }> = props => {
  return <div className={classes.backdrop} onClick={props.onDismiss} />;
};


/**
 * Solves for 1st quadrent root of this DQM quadratic
 * @param linearCoeffient 
 * @param quadraticCoefficent 
 */
const solveForPositiveRootDQM = (linearCoeffient: number, quadraticCoefficent: number, constantTerm: number) => {
    const root = (-linearCoeffient + Math.sqrt(
        Math.pow(linearCoeffient,2) - 4*quadraticCoefficent*constantTerm)
    )/(2*quadraticCoefficent);
    console.log(root);
    return root;
};

/**
 * Helper function to generate points (in SVG space) that represent our dynamic quorum curve
 * @param minQuorumBps 
 * @param maxQuorumBps 
 * @param height 
 * @param width 
 * @param linearCoefficent 
 * @param quadraticCoefficent 
 * @param numPoints 
 */
const generatePointsForSVGChart = (minQuorumBps: number, maxQuorumBps: number, height: number, width: number, linearCoefficent: number, quadraticCoefficent: number, offsetBps: number, numPoints: number) => {

    const positiveRootDQMPolynomial = solveForPositiveRootDQM(linearCoefficent, quadraticCoefficent, minQuorumBps - maxQuorumBps);
    // Space x points equally in [0, posDQMPolynomialRoot]
    // We do this to get a dense sample of the function in the range it's most interesting
    let xPoints = Array.from({length: numPoints}, (_, i) => Math.round(i*(Math.ceil(positiveRootDQMPolynomial)/numPoints)));
    for (let i = 0; i < 500; i++) {
        xPoints.push(positiveRootDQMPolynomial + i);
    }
    xPoints.push(positiveRootDQMPolynomial*2);
    xPoints.push(positiveRootDQMPolynomial*2.5);


    const yPoints = xPoints.map((againstVotesBPS: number) => {
        const adjustedAgainstVotesBps =  againstVotesBPS  > offsetBps ? (againstVotesBPS - offsetBps) : 0
        const quorumAdjustementBps = quadraticCoefficent * Math.pow(adjustedAgainstVotesBps, 2) + linearCoefficent * adjustedAgainstVotesBps;
        return min(minQuorumBps + quorumAdjustementBps, maxQuorumBps);
    });
    console.log(yPoints);


    const points = xPoints.map((x:number, i:number) => { return [x, yPoints[i]]});
    console.log("POINTS: ", points);

    const res =  makeSmoothSVGChart(
        points,
        2.5*width,
        height,
        {
            xMax: Math.ceil(2.5*positiveRootDQMPolynomial),
            xMin: 0,
            yMax: 1.06*maxQuorumBps,
            yMin: 0.87*minQuorumBps
        } as ChartBounds
    );
    // console.log(res);
    return res;
};

//  const generateVerticalLineForLabel = (minQuorumBps: number, maxQuorumBps: number, height: number, width: number, linearCoefficent: number, quadraticCoefficent: number, offsetBps: number, numPoints: number, totalSupply: number) => {

//     const positiveRootDQMPolynomial = solveForPositiveRootDQM(linearCoefficent, quadraticCoefficent, minQuorumBps - maxQuorumBps);
//     // Space x points equally in [0, posDQMPolynomialRoot]
//     // We do this to get a dense sample of the function in the range it's most interesting
//     let xPoints = Array.from({length: numPoints}, (_, i) => Math.round(i*(Math.ceil(positiveRootDQMPolynomial)/numPoints)));
//     for (let i = 0; i < 500; i++) {
//         xPoints.push(positiveRootDQMPolynomial + i);
//     }
//     xPoints.push(positiveRootDQMPolynomial*2);
//     xPoints.push(positiveRootDQMPolynomial*2.5);


//     const yPoints = xPoints.map((againstVotesBPS: number) => {
//         const adjustedAgainstVotesBps =  againstVotesBPS  > offsetBps ? (againstVotesBPS - offsetBps) : 0
//         const quorumAdjustementBps = quadraticCoefficent * Math.pow(adjustedAgainstVotesBps, 2) + linearCoefficent * adjustedAgainstVotesBps;
//         return min(minQuorumBps + quorumAdjustementBps, maxQuorumBps);
//     });
//     console.log(yPoints);


//     const points = xPoints.map((x:number, i:number) => { return [x, yPoints[i]]});
//     console.log("POINTS: ", points);

//     const res =  makeSmoothSVGChart(
//         points,
//         2.5*width,
//         height,
//         {
//             xMax: Math.ceil(2.5*positiveRootDQMPolynomial),
//             xMin: 0,
//             yMax: 1.06*maxQuorumBps,
//             yMin: 0.87*minQuorumBps
//         } as ChartBounds
//     );
//     console.log(res);
//     return res;
// };

const DynamicQuorumInfoModalOverlay: React.FC<{
  proposal: Proposal;
  againstVotesBps: number;
  minQuorumBps: number;
  maxQuorumBps: number;
  quadraticCoefficent: number;
  linearCoefficent: number;
  offsetBps: number;
  onDismiss: () => void;
}> = props => {
  const { onDismiss, proposal, againstVotesBps, minQuorumBps, maxQuorumBps, quadraticCoefficent, linearCoefficent, offsetBps } = props;


  const positiveRootDQMPolynomial = solveForPositiveRootDQM(linearCoefficent, quadraticCoefficent, minQuorumBps - maxQuorumBps);
  const options = {

            xMax: Math.ceil(2.5*positiveRootDQMPolynomial),
            xMin: 0,
            yMax: 1.06*maxQuorumBps,
            yMin: 0.87*minQuorumBps
  };


  const dqmFunction = (bps: number) => {
    const adjustedAgainstVotesBps =  bps  > offsetBps ? (bps - offsetBps) : 0
    const quorumAdjustementBps = quadraticCoefficent * Math.pow(adjustedAgainstVotesBps, 2) + linearCoefficent * adjustedAgainstVotesBps;
    return min(minQuorumBps + quorumAdjustementBps, maxQuorumBps);
  };


  const againstVotesLabelLineStart = pointsPositionsCalc(
      [[againstVotesBps,0]],
      320*2.5*1.25,
      320,
      options
  );

  console.log("START: ", againstVotesLabelLineStart);

  const againstVotesLabelLineEnd = pointsPositionsCalc(
      [[againstVotesBps, dqmFunction(againstVotesBps)]],
      320*2.5*1.25,
      320,
      options
  );

   // TODO
  const totalNounSupply = 316; // TODO get from chain at time of Prop snapshot
  const againstVotesAbs = Math.round((againstVotesBps/10_000)*totalNounSupply); // TODO get from chain

  return (
    <>
      <div className={classes.closeBtnWrapper}>
        <button onClick={onDismiss} className={classes.closeBtn}>
          <XIcon className={classes.icon} />
        </button>
      </div>
      <div className={classes.modal}>
        <div className={classes.content}>
          <h1
            className={classes.title}
            style={{
              marginBottom: '-1rem',
            }}
          >
            Dynamic Quorum
          </h1>

          <p
            style={{
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            <Trans>
              The Quorum (minimum number of For votes required to pass a proposal) is set as a
              function of the number of Against votes a proposal has recieved. The number of For
              votes required to pass Proposal {proposal.id} is given by the following curve:
            </Trans>
          </p>

          {/* Outter container */}
          <div className={clsx(classes.graphContainer, classes.outterGraphContainer)}>
            <div
              style={{
                display: 'flex',
              }}
            >
              {/* Y-Axis label */}
              <div
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Trans>Required % of Nouns to Pass</Trans>
              </div>

              {/* Inner graph container */}
              <div className={clsx(classes.graphContainer, classes.innerGraphContainer)}>
                <svg width="100%" height="320">

                  <line x1="0" y1={.9*320} x2="100%" y2={(.9) * 320}  stroke="#151C3B40"  stroke-width="4" stroke-dasharray="5" />
                  <line x1="0" y1={(.1) * 320} x2="100%" y2={(.1) * 320}  stroke="#151C3B40"  stroke-width="4" stroke-dasharray="5" />
                              <g fill="#4965F080" stroke="none" >


                    <path 
                    d={
                      generatePointsForSVGChart(
                          minQuorumBps,
                          maxQuorumBps,
                          320,
                          320*1.25, // TODO
                          linearCoefficent,
                          quadraticCoefficent,
                          offsetBps,
                          100,
                      )
                  } />
                    </g>


                  {/* Vertical Line indicating against BPS */}
                  <line 
                    x1={againstVotesLabelLineStart[0][0]}
                    y1={320} y2={againstVotesLabelLineEnd[0][1]}
                    x2={againstVotesLabelLineStart[0][0]}
                    stroke="var(--brand-color-red)"
                    stroke-width="4" 
                   />

                  {/* Horizontal Line Indicating Required For BPS */}
                  <line 
                    x1={0}
                    y1={againstVotesLabelLineEnd[0][1]}
                    y2={againstVotesLabelLineEnd[0][1]}
                    x2={againstVotesLabelLineStart[0][0]}
                    stroke="var(--brand-color-green)"
                    stroke-width="4" 
                   />

                    <circle cx={
                        againstVotesLabelLineEnd[0][0]
                    } cy={
                        againstVotesLabelLineEnd[0][1]
                    } r="7"
                    fill='var(--brand-gray-light-text)'
                    />

                    {/* <text x="20" y="24">Max Quorum: {Math.round((maxQuorumBps*totalNounSupply)/10_000)} Nouns ({maxQuorumBps/100}% of Nouns)</text> */}
                    <text x="20" y="24">Max Quorum: {Math.round((maxQuorumBps*totalNounSupply)/10_000)} Nouns</text>
                    <text x="195" y="24" fill="var(--brand-gray-light-text)">({maxQuorumBps/100}% of Nouns)</text>

                    {

                       Math.abs((againstVotesLabelLineEnd[0][1] - 10) - 288) > 100 ? (
                           <>
                        <text x="20" y="280">Min Quorum: {Math.round((minQuorumBps*totalNounSupply)/10_000)} Nouns</text>
                        <text x="195" y="280" fill="var(--brand-gray-light-text)">({minQuorumBps/100}% of Nouns)</text>
                        </>
                       ) :  (
                           <>
                            <text x="550" y="280">Min Quorum: {Math.round((minQuorumBps*totalNounSupply)/10_000)} Nouns</text>
                            <text x="720" y="280" fill="var(--brand-gray-light-text)">({minQuorumBps/100}% of Nouns)</text>
                            </>
                       )
                    }

                    {
                        againstVotesBps >= 400 && (
                    <text x={10} y={againstVotesLabelLineEnd[0][1] - 10} fill="var(--brand-gray-light-text)">
                        {
                            Math.round(Math.min(maxQuorumBps, dqmFunction(againstVotesBps)) / 100)
                        }% of Nouns 
                            </text>
                        )
                    }

                    <text x={againstVotesLabelLineEnd[0][0] + 10} y={againstVotesLabelLineEnd[0][1] - 10}>Nouns Currently Against: {againstVotesAbs} → Current Quorum: {Math.round((
                        (Math.min(maxQuorumBps, dqmFunction(againstVotesBps))*totalNounSupply)/10_000
                    ))} 
                     </text>


                     <text x={againstVotesLabelLineEnd[0][0] + 10} y={310} fill="var(--brand-gray-light-text)">
                        {Math.round(againstVotesBps/100)}% of Nouns  
                     </text>

                  Sorry, your browser does not support inline SVG.
                </svg>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Trans>% of Nouns Currently Against</Trans>
            </div>
          </div>

          <p style={{ opacity: '50%', fontSize: '14px', fontWeight: 'normal', marginLeft: '0rem' }}>
            More details on how dynamic quorum works can be found{' '}
            <span style={{ textDecoration: 'underline' }}>here</span>.
          </p>
        </div>
      </div>
    </>
  );
};

const DynamicQuorumInfoModal: React.FC<{
  proposal: Proposal;
  againstVotesAbs: number;
  againstVotesBps: number;
  minQuorumBps: number;
  maxQuorumBps: number;
  quadraticCoefficent: number;
  linearCoefficent: number;
  offsetBps: number;
  onDismiss: () => void;
}> = props => {
  const { onDismiss, proposal } = props;
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={onDismiss} />,
        document.getElementById('backdrop-root')!,
      )}
      {ReactDOM.createPortal(
        <DynamicQuorumInfoModalOverlay
          againstVotesBps={400} // TODO tack on 50 BPS when at 0 to make it visualize nicer -- switch side after certain point --- max X scale
          minQuorumBps={1000}
          maxQuorumBps={2000}
          quadraticCoefficent={0.0005}
          linearCoefficent={0.01}
          offsetBps={250}
          onDismiss={onDismiss}
          proposal={proposal}
        />,
        document.getElementById('overlay-root')!,
      )}
    </>
  );
};

export default DynamicQuorumInfoModal;