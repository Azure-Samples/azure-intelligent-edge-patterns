/* eslint-disable prefer-destructuring */

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import dotenv from 'dotenv';

dotenv.config();

export const FHIR_API_URL = process.env.FHIR_API_URL;
export const IOT_HUB_CONNECTION_STRING = process.env.IOT_HUB_CONNECTION_STRING;
