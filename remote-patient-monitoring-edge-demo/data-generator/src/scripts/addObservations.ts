#!/usr/bin/env node

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import yargs, { exit } from 'yargs';
import { Destination, DestinationsOptions, HealthTrendsOptions, HEALTHY, IMPROVING, MAX_DAYS_ALLOWED, MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS, WORSENING } from '../util/constants';
import { addObservations } from '../util/addGenericObservations';
import { HealthTrend } from '../util/trendFunctions';

export interface AddObsArguments {
  destination: Destination;
  patientUuid: string;
  numberOfDays: number | undefined;
  healthTrend: HealthTrend
}

const options: AddObsArguments = yargs
  .usage('Usage: -d <iothub or fhir> -u <patientUuid> -t <healthTrend> [-n <numberOfDays> (optional. default is 1 - today)]')
  .options({
    destination: { alias: 'd', describe: 'Destination: iothub or fhir', choices: DestinationsOptions, demandOption: true },
    patientUuid: { alias: 'u', describe: 'Existing Patient UUID', type: 'string', demandOption: true },
    numberOfDays: { alias: 'n', describe: 'Past number of days to generate data for', type: 'number', demandOption: false },
    healthTrend: { alias: 't', describe: `Health Trend of created vitals over time: ${HEALTHY} or ${WORSENING} or ${IMPROVING}`, choices: HealthTrendsOptions, demandOption: true },
  })
  .argv;

const notAtLeastMinimumTrendingDays = !options.numberOfDays || options.numberOfDays < MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS;
if (notAtLeastMinimumTrendingDays && options.healthTrend !== HEALTHY) {
  console.error(`Please select a numberOfDays >= ${MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS} to generate WORSENING or IMPROVING patient data`);
  exit(1, new Error());
}

if (options.numberOfDays > MAX_DAYS_ALLOWED) {
  console.error(`Please select a numberOfDays of ${MAX_DAYS_ALLOWED} or less.`);
  exit(1, new Error());
}

addObservations(options);
