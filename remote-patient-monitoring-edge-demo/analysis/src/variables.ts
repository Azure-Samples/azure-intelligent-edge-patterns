/* eslint-disable prefer-destructuring */

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import dotenv from 'dotenv';
import { WEIGHT_CODE } from './constants';

dotenv.config();

export const POLLING_INTERVAL_IN_MS = 5000;
export const SERVER_PORT = 5000;
export const FHIR_API_URL = process.env.FHIR_URL;

export const putObservationsUrl = (observationId: string): string => `${FHIR_API_URL}/Observation/${observationId}`;
export const preliminaryWeightObservationsUrl = `${FHIR_API_URL}/Observation?status=preliminary&_count=100&code=${WEIGHT_CODE}`;
export const preliminaryVitalsUrl = `${FHIR_API_URL}/Observation?status=preliminary&_count=100`;
