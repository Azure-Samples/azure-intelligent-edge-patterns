import userEvent from '@testing-library/user-event';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { render } from '../../testUtils/renderWithRedux';
import { dummyFunction } from '../../utils/dummyFunction';
import { AddEditPartPanel, PanelMode } from '../AddPartPanel';
import { postPart as mockPostPart } from '../../store/partSlice';

jest.mock('../../store/partSlice', () => ({
  ...jest.requireActual('../../store/partSlice'),
  postPart: jest.fn(),
}));

test('should able to enter part name and description', () => {
  const { getByLabelText } = render(
    <AddEditPartPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} />,
  );

  userEvent.type(getByLabelText(/Object name/), 'test object');
  userEvent.type(getByLabelText(/Description/), 'description');

  expect(getByLabelText(/Object name/)).toHaveValue('test object');
  expect(getByLabelText(/Description/)).toHaveValue('description');
});

test('should dispatch the right API in different mode', async () => {
  (mockPostPart as any).mockReturnValueOnce(dummyFunction);
  const { getByLabelText, getByRole } = render(
    <AddEditPartPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} />,
  );
  userEvent.type(getByLabelText(/object name/i), 'test object');
  userEvent.type(getByLabelText(/description/i), 'description');

  userEvent.click(getByRole('button', { name: /add/i }));

  await waitFor(() => {
    expect(mockPostPart).toHaveBeenCalledTimes(1);
    expect(mockPostPart).toHaveBeenCalledWith({ name: 'test object', description: 'description' });
  });
});
