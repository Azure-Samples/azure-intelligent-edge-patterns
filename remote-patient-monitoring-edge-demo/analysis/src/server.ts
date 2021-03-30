/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import express from 'express';
import { analyzePreliminaryObservations } from './analysisEngine/analysisEngine';
import { POLLING_INTERVAL_IN_MS, SERVER_PORT } from './variables';

const app = express();
app.use(express.json());

app.listen(SERVER_PORT, () => {
  setInterval(async () => {
    await analyzePreliminaryObservations();
  }, POLLING_INTERVAL_IN_MS);
  console.log(`Server running on port ${SERVER_PORT}`);
});
