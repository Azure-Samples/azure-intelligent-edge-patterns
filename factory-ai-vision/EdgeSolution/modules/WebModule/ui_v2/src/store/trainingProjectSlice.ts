import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import {
  getInitialDemoState,
  isCRDAction,
  insertDemoFields,
  getSliceApiByDemo,
  getNonDemoSelector,
} from './shared/DemoSliceUtils';
import { createWrappedAsync } from './shared/createWrappedAsync';

type TrainingProject = {
  id: number;
  name: string;
  customVisionId: string;
  isDemo: boolean;
};

const normalize = (e) => ({
  id: e.id,
  name: e.name,
  customVisionId: e.customvision_id,
  isDemo: e.is_demo,
});

export const getTrainingProject = createWrappedAsync<any, boolean, { state: State }>(
  'trainingSlice/get',
  async (isDemo): Promise<TrainingProject[]> => {
    const response = await getSliceApiByDemo('projects', isDemo);
    return response.data.map(normalize);
  },
);

export const createNewTrainingProject = createWrappedAsync<any, string, { state: State }>(
  'trainingSlice/createNew',
  async (name, { getState }) => {
    const [nonDemoProject] = getState().trainingProject.nonDemo;
    const response = await Axios.get(`/api/projects/${nonDemoProject}/reset_project?project_name=${name}`);
    return normalize(response.data);
  },
);

const entityAdapter = createEntityAdapter<TrainingProject>();

const slice = createSlice({
  name: 'trainingSlice',
  initialState: getInitialDemoState(entityAdapter.getInitialState()),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTrainingProject.fulfilled, entityAdapter.setAll)
      .addCase(createNewTrainingProject.fulfilled, entityAdapter.upsertOne)
      .addMatcher(isCRDAction, insertDemoFields);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllTrainingProjects,
  selectById: selectTrainingProjectById,
  selectEntities: selectTrainingProjectEntities,
} = entityAdapter.getSelectors((state: State) => state.trainingProject);

export const selectNonDemoProject = getNonDemoSelector('trainingProject', selectTrainingProjectEntities);

/**
 * Return the non demo project in the shape of IDropdownOptions.
 * If the given training project is in the predefined scenarios, also return the training project of the scenario.
 * @param trainingProjectId
 */
export const trainingProjectOptionsSelector = (trainingProjectId: number) =>
  createSelector(
    [selectAllTrainingProjects, (state: State) => state.scenario],
    (trainingProjects, scenarios) => {
      const relatedScenario = scenarios.find((e) => e.trainingProject === trainingProjectId);
      return trainingProjects
        .filter((t) => !t.isDemo || t.id === relatedScenario?.trainingProject)
        .map((e) => ({
          key: e.id,
          text: e.name,
        }));
    },
  );
