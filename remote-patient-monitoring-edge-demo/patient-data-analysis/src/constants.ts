/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { Analyses, Analysis, analyzeHR, analyzeRespiratoryRate, analyzeSpO2, analyzeSystolicBP } from './analysisEngine/analyzers';

export const INTERPRETATION_URL = 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation';

const HEART_RATE_CODE = '8867-4';
const DBP_CODE = '8462-4';
const SBP_CODE = '8480-6';
const RR_CODE = '9279-1';
const SPO2_CODE = '59408-5';
export const WEIGHT_CODE = '3141-9';

export const MAX_BUNDLE_SIZE = 100;

export const codeToAnalyzer = {
  [HEART_RATE_CODE]: analyzeHR,
  [SBP_CODE]: analyzeSystolicBP,
  [RR_CODE]: analyzeRespiratoryRate,
  [SPO2_CODE]: analyzeSpO2,
  [DBP_CODE]: (): Analysis => Analyses.Indeterminate,
  [WEIGHT_CODE]: (): Analysis => Analyses.Indeterminate,
};
