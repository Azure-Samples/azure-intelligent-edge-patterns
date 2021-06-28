/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

// ----- PRIMITIVES ----

export const FHIR_SERVER: 'fhir' = 'fhir' as const;
const IOT_HUB = 'iothub' as const;

export const IMPROVING = 'improving' as const;
export const WORSENING = 'worsening' as const;
export const HEALTHY = 'healthy' as const;

export const MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS = 3;
export const MAX_DAYS_ALLOWED = 10;
export const MAX_NUMBER_PATIENTS = 20;

// ----- SCRIPT OPTIONS ----

export type Destination = typeof FHIR_SERVER | typeof IOT_HUB;
type HealthTrend = typeof HEALTHY | typeof IMPROVING | typeof WORSENING;

export const HealthTrendsOptions: ReadonlyArray<HealthTrend> = [WORSENING, IMPROVING, HEALTHY];
export const DestinationsOptions: ReadonlyArray<Destination> = [IOT_HUB, FHIR_SERVER];
