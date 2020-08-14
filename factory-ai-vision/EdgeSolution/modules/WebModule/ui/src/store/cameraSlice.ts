import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';
import * as R from 'ramda';
import { State } from 'RootStateType';
import { schema, normalize } from 'normalizr';
import { BoxLabel } from './type';
import { createAOI, removeAOI, toggleShowAOI } from './actions';

type CameraFromServer = {
  id: number;
  name: string;
  rtsp: string;
  area: string;
  is_demo: boolean;
};

type CameraFromServerWithSerializeArea = Omit<CameraFromServer, 'area'> & {
  area: {
    useAOI: boolean;
    AOIs: BoxLabel & { id: string };
  };
};

export type Camera = {
  id: number;
  name: string;
  rtsp: string;
  area: string;
  useAOI: boolean;
  AOIs: string[];
};

const normalizeCameraShape = (response: CameraFromServerWithSerializeArea) => {
  return {
    id: response.id,
    name: response.name,
    rtsp: response.rtsp,
    useAOI: response.area.useAOI,
    AOIs: response.area.AOIs,
  };
};

const normalizeCamerasAndAOIsByNormalizr = (data: CameraFromServerWithSerializeArea[]) => {
  const AOIs = new schema.Entity('AOIs', undefined, {
    processStrategy: (value, parent) => {
      return {
        ...value,
        camera: parent.id,
      };
    },
  });

  const cameras = new schema.Entity(
    'cameras',
    { AOIs: [AOIs] },
    {
      processStrategy: normalizeCameraShape,
    },
  );

  return normalize(data, [cameras]);
};

const getAOIData = (cameraArea: string) => {
  try {
    return JSON.parse(cameraArea);
  } catch (e) {
    return {
      useAOI: false,
      AOIs: [],
    };
  }
};

const serializeAreas = R.map<CameraFromServer, CameraFromServerWithSerializeArea>((e) => ({
  ...e,
  area: getAOIData(e.area),
}));

const normalizeCameras = R.compose(normalizeCamerasAndAOIsByNormalizr, serializeAreas);

const entityAdapter = createEntityAdapter<Camera>();

export const getCameras = createAsyncThunk<any, boolean, { state: State }>(
  'cameras/get',
  async (isDemo) => {
    const response = await Axios(`/api/cameras?is_demo=${Number(isDemo)}`);
    return normalizeCameras(response.data);
  },
  {
    condition: (_, { getState }) => getState().camera.ids.length === 0,
  },
);

export const postCamera = createAsyncThunk(
  'cameras/post',
  async (newCamera: Pick<Camera, 'name' | 'rtsp'>) => {
    const response = await Axios.post(`/api/cameras/`, newCamera);
    return response.data;
  },
);

export const deleteCamera = createAsyncThunk('cameras/delete', async (id: number) => {
  await Axios.delete(`/api/cameras/${id}/`);
  return id;
});

const slice = createSlice({
  name: 'cameras',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCameras.fulfilled, (state, action) =>
        entityAdapter.setAll(state, action.payload.entities.cameras || {}),
      )
      .addCase(postCamera.fulfilled, entityAdapter.addOne)
      .addCase(deleteCamera.fulfilled, entityAdapter.removeOne)
      .addCase(createAOI, (state, action) => {
        state.entities[action.payload.cameraId].AOIs.push(action.payload.id);
      })
      .addCase(removeAOI, (state, action) => {
        let { AOIs } = state.entities[action.payload.cameraId];
        AOIs = AOIs.filter((e) => e !== action.payload.AOIId);
      })
      .addCase(toggleShowAOI.pending, (state, action) => {
        const { showAOI, cameraId } = action.meta.arg;
        state.entities[cameraId].useAOI = showAOI;
      })
      .addCase(toggleShowAOI.rejected, (state, action) => {
        const { showAOI, cameraId } = action.meta.arg;
        state.entities[cameraId].useAOI = !showAOI;
      });
  },
});

const { reducer } = slice;
export default reducer;

export const { selectAll: selectAllCameras, selectById: selectCameraById } = entityAdapter.getSelectors(
  (state: State) => state.camera,
);
