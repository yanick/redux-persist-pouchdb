import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-adapter-memory'));

import {createStore} from 'redux';
import {persistStore,persistReducer} from 'redux-persist';
import {PouchDBStorage} from './index';

const sampleReducer = function(state = {i: 0}, action) {
  if (action.type === 'INC') {
    return {...state, i: 1 + state.i};
  }
  return state;
};

function createPersistor(store) {
  return new Promise(accept => {
    try {
      const persistor = persistStore(store, {
          writeFailHandler: e => throw new Error(e)
      }, () => accept(persistor));
    } catch (e) {
      console.log(e);
    }
  });
}

test('basic', async () => {
  const storage = new PouchDBStorage('test-basic', {adapter: 'memory'});

  const reducer = function(state = {i: 0}, action) {
    if (action.type === 'INC') {
      return {i: 1 + state.i};
    }
    return state;
  };

  const persistedReducer = persistReducer({storage, key: 'myRoot'}, reducer);

  const store = createStore(persistedReducer);

  const persistor = await createPersistor(store);

  const INC = {type: 'INC'};

  store.dispatch(INC);
  store.dispatch(INC);

  expect(store.getState()).toHaveProperty('i', 2);

  await persistor.flush();

  store.dispatch(INC);
  await persistor.flush();

  expect(store.getState()).toHaveProperty('i', 3);
});

test('pass the db directly', async () => {
  const db = new PouchDB('test-direct-db', {adapter: 'memory'});
  const storage = new PouchDBStorage(db);

  const persistedReducer = persistReducer({storage, key: 'myRoot'}, sampleReducer);

  const store = createStore(persistedReducer);

  const persistor = await createPersistor(store);

  const INC = {type: 'INC'};

  store.dispatch(INC);
  store.dispatch(INC);

  expect(store.getState()).toHaveProperty('i', 2);
});

test('not saving pouchdb_rev', async () => {
  const storage = new PouchDBStorage('salvation', {adapter: 'memory'});

  const persistedReducer = persistReducer(
    {storage, key: 'myRoot'},
    sampleReducer,
  );

  const store = createStore(persistedReducer);

  const persistor = await createPersistor(store);

  const INC = {type: 'INC'};

  store.dispatch(INC);
  store.dispatch(INC);

  expect(store.getState()).toHaveProperty('i', 2);

  await persistor.flush();

  expect(storage.db.get('persist:myRoot')).resolves.not.toHaveProperty(
    'doc._rev',
  );
});
