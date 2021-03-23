/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import * as React from 'react';
import { Fabric, mergeStyles, Shimmer, ShimmerElementType } from '@fluentui/react';

const wrapperClass = mergeStyles({
  width: '100%',
  padding: 2,
  selectors: {
    '& > .ms-Shimmer-container': {
      margin: '10px 0',
    },
  },
});

const shimmerWithElementSecondRow = [
  { type: ShimmerElementType.gap, width: '1%' },
  { type: ShimmerElementType.line, height: 40, width: '20%' },
  { type: ShimmerElementType.gap, width: '1%' },
  { type: ShimmerElementType.line, height: 40, width: '20%' },
  { type: ShimmerElementType.gap, width: '1%' },
  { type: ShimmerElementType.line, height: 40, width: '20%' },
  { type: ShimmerElementType.gap, width: '1%' },
  { type: ShimmerElementType.line, height: 40, width: '20%' },
  { type: ShimmerElementType.gap, width: '1%' },
  { type: ShimmerElementType.line, height: 40, width: '20%' },
];

export const AppShimmer: React.FunctionComponent = () => (
  <Fabric className={wrapperClass}>
    <Shimmer shimmerElements={shimmerWithElementSecondRow} />
  </Fabric>
);
