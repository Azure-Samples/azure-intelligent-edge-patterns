/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

export const HR_CODE = '8867-4' as const;
export const SBP_CODE = '8480-6' as const;
export const DBP_CODE = '8462-4' as const;
export const WEIGHT_CODE = '3141-9' as const;
export const SPO2_CODE = '59408-5' as const;
export const RESP_CODE = '9279-1' as const;

export type VitalCode = typeof HR_CODE
| typeof SBP_CODE
| typeof DBP_CODE
| typeof WEIGHT_CODE
| typeof SPO2_CODE
| typeof RESP_CODE;
