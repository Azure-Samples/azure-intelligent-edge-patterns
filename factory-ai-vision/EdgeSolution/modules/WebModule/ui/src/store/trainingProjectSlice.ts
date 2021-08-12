/* eslint-disable @typescript-eslint/camelcase */

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
import { getParts } from './partSlice';
import { thunkGetAllCvProjects } from './setting/settingAction';

type TrainingProjectCategory = 'customvision' | 'OVMS';

type Input = {
  name: string;
  width: number;
  height: number;
  data_type: string;
  dims: string[];
  color_format: string;
};

type Output = {
  name: string;
  dims: string[];
};

export type TrainingProject = {
  id: number;
  name: string;
  customVisionId: string;
  isDemo: boolean;
  isPredicationModel: boolean;
  predictionUri: string;
  predictionHeader: string;
  category: TrainingProjectCategory;
  projectType: string;
  isCascade: boolean;
  block_inputs: Input[];
  block_outputs: Output[];
  node_type: string;
};

export type CreatOwnModelPayload = {
  is_prediction_module: boolean;
  name: string;
  labels: string;
  prediction_uri: string;
  prediction_header: string;
};

export type createCustomVisionProjectPayload = {
  name: string;
  tags: string[];
  project_type: string;
};

export type updateCustomVisionProjectTagsPayload = {
  id: string;
  tags: string[];
};

const normalize = (e) => ({
  id: e.id,
  name: e.name,
  customVisionId: e.customvision_id,
  isDemo: e.is_demo,
  isPredicationModel: e.is_prediction_module,
  predictionUri: e.prediction_uri,
  predictionHeader: e.prediction_header,
  category: e.category,
  projectType: e.project_type,
  isCascade: e.is_cascade,
  block_inputs: e.block_inputs === '' ? [] : JSON.parse(e.block_inputs),
  block_outputs: e.block_outputs === '' ? [] : JSON.parse(e.block_outputs),
  node_type: e.node_type,
});

export const getTrainingProject = createWrappedAsync<any, boolean, { state: State }>(
  'trainingSlice/get',
  async (isDemo): Promise<TrainingProject[]> => {
    // FIXME Make it better!
    const response = await getSliceApiByDemo('projects', true);
    return response.data.map(normalize);
  },
  // {
  //   condition: (isDemo, { getState }) => {
  //     if (isDemo && getState().trainingProject.isDemo.length) return false;
  //     if (!isDemo && getState().trainingProject.nonDemo.length) return false;
  //     return true;
  //   },
  // },
);

export const refreshTrainingProject = createWrappedAsync(
  'trainingProject/refresh',
  async (_, { dispatch }) => {
    const response = await Axios(`/api/projects/`);
    dispatch(getParts());
    return response.data.map(normalize);
  },
);

export const pullCVProjects = createWrappedAsync<
  any,
  { selectedCustomvisionId: string; loadFullImages: boolean },
  { state: State }
>(
  'trainingProject/pullCVProjects',
  async ({ selectedCustomvisionId, loadFullImages }, { getState, dispatch }) => {
    const trainingProjectId = selectNonDemoProject(getState())[0].id;
    await Axios.get(
      `/api/projects/${trainingProjectId}/pull_cv_project?customvision_project_id=${selectedCustomvisionId}&partial=${Number(
        !loadFullImages,
      )}`,
    );
    // Get training project because the origin project name will be mutate
    dispatch(refreshTrainingProject());
    dispatch(getParts());
  },
);

export const createNewTrainingProject = createWrappedAsync<any, string, { state: State }>(
  'trainingSlice/createNew',
  async (name, { getState, dispatch }) => {
    const [nonDemoProject] = getState().trainingProject.nonDemo;
    const response = await Axios.get(`/api/projects/${nonDemoProject}/reset_project?project_name=${name}`);

    dispatch(refreshTrainingProject());

    console.log('createNewTrainingProject', response.data);

    return normalize(response.data);
  },
);

export const createCustomVisionProjectAndModel = createWrappedAsync<any, string, { state: State }>(
  'trainingSlice/createNew',
  async (name, { getState, dispatch }) => {
    const [nonDemoProject] = getState().trainingProject.nonDemo;
    const response = await Axios.get(`/api/projects/${nonDemoProject}/reset_project?project_name=${name}`);

    // dispatch(refreshTrainingProject());
    dispatch(
      pullCVProjects({ selectedCustomvisionId: response.data.customvision_id, loadFullImages: false }),
    );

    console.log('createNewTrainingProject', response.data);

    return normalize(response.data);
  },
);

const extractConvertCustomProject = (project) => {
  return {
    is_prediction_module: true,
    name: project.name,
    labels: project.labels,
    prediction_uri: project.endPoint,
    prediction_header: project.header,
  };
};

export const createCustomVisionProject = createWrappedAsync<any, createCustomVisionProjectPayload>(
  'trainingSlice/createCustomVisionProject',
  async (payload, { dispatch }) => {
    await Axios.post(`/api/projects/9/create_cv_project/`, payload);

    dispatch(refreshTrainingProject());
    dispatch(getParts());
    dispatch(thunkGetAllCvProjects());
  },
);

export const updateCustomVisionProjectTags = createWrappedAsync<
  any,
  updateCustomVisionProjectTagsPayload,
  { state: State }
>('trainingSlice/updateCustomVisionTags', async ({ id, tags }, { dispatch }) => {
  const response = await Axios.post(`/api/projects/${id}/update_tags`, { tags });

  console.log('createNewTrainingProject', response.data);

  dispatch(getParts());
  dispatch(refreshTrainingProject());
});

export const createCustomProject = createWrappedAsync<any, CreatOwnModelPayload, { state: State }>(
  'trainingSlice/createNewCustom',
  async (payload) => {
    const response = await Axios.post(`/api/projects`, payload);
    return normalize(response.data);
  },
);

export const updateCustomProject = createWrappedAsync<any, any, { state: State }>(
  'trainingSlice/UpdateCustom',
  async (project) => {
    const data = extractConvertCustomProject(project);

    const response = await Axios.patch(`/api/projects/${project.id}`, data);
    return normalize(response.data);
  },
);

export const deleteCustomProject = createWrappedAsync<any, { id: number; resolve: () => void }>(
  'trainingSlice/DeleteCustom',
  async ({ id, resolve }) => {
    await Axios.delete(`/api/projects/${id}/`);

    resolve();

    return id;
  },
);

export const getSelectedProjectInfo = createWrappedAsync<any, string, { state: State }>(
  'trainingSlice/GetSelectedProjectInfo',
  async (id, { getState }) => {
    const settingId = getState().setting.current.id;
    // await Axios.delete(`/api/settings/9/project_info?customvision_id=${id}`);
    const response = await Axios.get(`/api/settings/${settingId}/project_info?customvision_id=${id}`);

    return response.data;
  },
);

const entityAdapter = createEntityAdapter<TrainingProject>();

const slice = createSlice({
  name: 'trainingSlice',
  initialState: getInitialDemoState(entityAdapter.getInitialState()),
  reducers: {
    onEmptySelectedProjectInfo: (state) => ({
      ...state,
      selectedProjectInfo: null,
    }),
    // closeLabelingPage: (state) => ({
    //   ...state,
    //   imageIds: [],
    //   selectedImageId: null,
    // }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrainingProject.fulfilled, entityAdapter.setAll)
      .addCase(refreshTrainingProject.fulfilled, entityAdapter.setAll)
      .addCase(createNewTrainingProject.fulfilled, entityAdapter.upsertOne)
      .addCase(createCustomProject.fulfilled, entityAdapter.upsertOne)
      .addCase(updateCustomProject.fulfilled, entityAdapter.upsertOne)
      .addCase(deleteCustomProject.fulfilled, entityAdapter.removeOne)
      .addCase(getSelectedProjectInfo.fulfilled, (state, action) => {
        const { payload } = action;

        state.selectedProjectInfo = payload;
      })
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
export const { onEmptySelectedProjectInfo } = slice.actions;

export const selectNonDemoProject = getNonDemoSelector('trainingProject', selectTrainingProjectEntities);

/**
 * Return the non demo project in the shape of IDropdownOptions.
 * If the given training project is in the predefined scenarios, also return the training project of the scenario.
 * @param trainingProjectId
 */
export const trainingProjectOptionsSelectorFactory = (trainingProjectId: number) =>
  createSelector(
    [selectAllTrainingProjects, (state: State) => state.scenario],
    (trainingProjects, scenarios) => {
      const relatedScenario = scenarios.find((e) => e.trainingProject === trainingProjectId);

      return trainingProjects
        .filter((t) => !t.isDemo || t.id === relatedScenario?.trainingProject)
        .filter((t) => t.id !== 9)
        .map((e) => ({
          key: e.id,
          text: e.name,
        }));
    },
  );

export const trainingProjectIsPredictionModelFactory = () =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo).filter((project) => project.id !== 9),
  );

export const trainingProjectIsCascadesFactory = () =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo).filter((project) => project.isCascade),
  );
