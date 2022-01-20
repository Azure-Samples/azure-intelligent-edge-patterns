#!/usr/bin/env node

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import yargs from 'yargs';
import { deletePatient } from '../util/observationsClient';

interface Arguments {
  patientUuid: string;
}

const options: Arguments = yargs
  .usage('Usage: -u <patientUuid>')
  .option('patientUuid', { alias: 'u', describe: 'Existing Patient UUID', type: 'string', demandOption: true })
  .argv;

deletePatient(options.patientUuid);
