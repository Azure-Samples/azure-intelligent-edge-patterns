import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, IDropdownOption, Stack } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';

import { customVisionTrainingProjectFactory } from '../store/trainingProjectSlice';

import { Url } from '../constant';
import { EmptyAddIcon } from '../components/EmptyAddIcon';

export const Images: React.FC = () => {
  const trainingProjectIsPredictionModel = useSelector(customVisionTrainingProjectFactory());

  const history = useHistory();

  const projectsOptions: IDropdownOption[] = trainingProjectIsPredictionModel.map(({ id, name }) => ({
    key: id,
    text: name,
  }));

  const onClickDropdown = useCallback(
    (option: IDropdownOption) => {
      history.push(
        generatePath(Url.IMAGES_DETAIL, {
          id: option.key,
        }),
      );
    },
    [history],
  );

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <EmptyAddIcon
        title="Select Model"
        subTitle=""
        node={
          <Dropdown
            styles={{ dropdown: { width: '400px' } }}
            options={projectsOptions}
            onChange={(_, option: IDropdownOption) => onClickDropdown(option)}
          />
        }
      />
    </Stack>
  );
};
