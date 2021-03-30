/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

export interface Analysis {
  code: string;
  display: string;
  description?: string; // e.g. "Weight has increased 5 pounds in the last week"
}

export const Analyses = Object.freeze({
  CriticalLow: {
    code: 'LL',
    display: 'Critical Low',
  },
  Low: {
    code: 'L',
    display: 'Low',
  },
  Normal: {
    code: 'N',
    display: 'Normal',
  },
  High: {
    code: 'H',
    display: 'High',
  },
  CriticalHigh: {
    code: 'HH',
    display: 'Critical High',
  },
  Indeterminate: {
    code: 'IND',
    display: 'Indeterminate',
  },
});

export const analyzeHR = (hr: number | undefined): Analysis => {
  if (!hr) { return Analyses.Indeterminate; }
  if (hr < 50) { return Analyses.CriticalLow; }
  if (hr >= 50 && hr < 55) { return Analyses.Low; }
  if (hr >= 55 && hr <= 90) { return Analyses.Normal; }
  if (hr > 90 && hr <= 110) { return Analyses.High; }
  return Analyses.CriticalHigh;
};

export const analyzeSystolicBP = (sbp: number | undefined): Analysis => {
  if (!sbp) { return Analyses.Indeterminate; }
  if (sbp < 85) { return Analyses.CriticalLow; }
  if (sbp >= 85 && sbp < 95) { return Analyses.Low; }
  if (sbp >= 95 && sbp <= 150) { return Analyses.Normal; }
  if (sbp > 150 && sbp <= 180) { return Analyses.High; }
  return Analyses.CriticalHigh;
};

export const analyzeSpO2 = (spO2percent: number | undefined): Analysis => {
  if (!spO2percent) { return Analyses.Indeterminate; }
  if (spO2percent < 90) { return Analyses.CriticalLow; }
  if (spO2percent >= 90 && spO2percent < 94) { return Analyses.Low; }
  return Analyses.Normal;
};

export const analyzeRespiratoryRate = (rr: number | undefined): Analysis => {
  if (!rr) { return Analyses.Indeterminate; }
  if (rr < 10) { return Analyses.CriticalLow; }
  if (rr >= 10 && rr < 12) { return Analyses.Low; }
  if (rr >= 12 && rr <= 24) { return Analyses.Normal; }
  if (rr > 24 && rr <= 34) { return Analyses.High; }
  return Analyses.CriticalHigh;
};

/* Analyze weights for critical weight gain over time
critical weight gain is either: > 2 lbs gained in 1 day (24 hours)
  OR > 4 lbs gained in 7 days (168 hours)
This specific weight gain is associated with worsening Congestive Heart Failure
*/

export const analyzeWeightSeries = (allWeightVitals: number[]): Analysis => {
  if (!allWeightVitals) return Analyses.Normal;

  const weightMeasurementsPerDay = allWeightVitals.length;

  const lastSevenWeightMsmts = allWeightVitals.slice(-7);
  const weightSevenDaysAgo = lastSevenWeightMsmts[0];

  let aggregateWeightDifference = 0;
  let previousWeight = weightSevenDaysAgo;
  for (let i = 0; i < lastSevenWeightMsmts.length; i += 1) {
    const weight = lastSevenWeightMsmts[i];
    aggregateWeightDifference += weight - previousWeight;
    previousWeight = weight;
  }

  if (aggregateWeightDifference > 4) {
    return {
      code: Analyses.CriticalHigh.code,
      display: Analyses.CriticalHigh.display,
      description: `Weight has increased ${aggregateWeightDifference} pounds in the last week`,
    };
  }

  if (weightMeasurementsPerDay >= 2) {
    const lastWeight = allWeightVitals[allWeightVitals.length - 1];
    const penultimateWeight = allWeightVitals[allWeightVitals.length - 2];
    const weightDifference = lastWeight - penultimateWeight;
    if (weightDifference > 2) {
      return {
        code: Analyses.CriticalHigh.code,
        display: Analyses.CriticalHigh.display,
        description: `Weight has increased ${weightDifference} pounds in the last 24 hours`,
      };
    }
    return Analyses.Normal;
  }

  return Analyses.Normal;
};
