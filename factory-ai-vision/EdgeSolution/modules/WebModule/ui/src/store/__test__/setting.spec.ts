import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moxios from 'moxios';

import { thunkPostSetting } from '../setting/settingAction';
import { initialState } from '../setting/settingReducer';
import { getTrainingProject } from '../trainingProjectSlice';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const mockSettingRes = {
  id: 0,
  training_key: 'test_training_key',
  endpoint: 'test_endpoint',
  is_trainer_valid: true,
  app_insight_has_init: true,
  is_collect_data: false,
};

describe('Post setting thunk', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('Should dispatch thunkGetAllCvProjects', async () => {
    const store = mockStore({ setting: initialState });

    moxios.wait(function () {
      moxios.requests.mostRecent().respondWith({
        status: 200,
        response: mockSettingRes,
      });
    });
    await store.dispatch(thunkPostSetting());

    const actions = store.getActions();
    expect(actions).toEqual(expect.arrayContaining([{ type: 'settings/listAllProjects/pending' }]));
  });

  it('Should dispatch getTrainingProject', async () => {
    const store = mockStore({ setting: initialState });

    moxios.wait(function () {
      moxios.requests.mostRecent().respondWith({
        status: 200,
        response: mockSettingRes,
      });
    });
    await store.dispatch(thunkPostSetting());

    const actions = store.getActions();
    const containGetTrainingProjectAction = actions.some((a) => a.type === getTrainingProject.pending.type);
    expect(containGetTrainingProjectAction).toBeTruthy();
  });
});
