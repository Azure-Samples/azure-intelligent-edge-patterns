/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const textElement = screen.getByText(/dashboard/i);
  expect(textElement).toBeInTheDocument();
});
