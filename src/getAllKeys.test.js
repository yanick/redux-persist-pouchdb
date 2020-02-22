import PouchDB from "pouchdb";
import PouchDBStorage from "./index";
import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";

PouchDB.plugin(require("pouchdb-adapter-memory"));

function createPersistor(store) {
  return new Promise(accept => {
    try {
      const persistor = persistStore(
        store,
        {
          writeFailHandler: e => throw new Error(e)
        },
        () => accept(persistor)
      );
    } catch (e) {
      console.log(e);
    }
  });
}

test('getAllKeys', async () => {
    const storage = new PouchDBStorage("getAllKeys", { adapter: "memory" });
  const persistedReducer = persistReducer({ storage, key: "myRoot" }, (state={}) => ({ ...state, foo: 13}));

  const store = createStore(persistedReducer);
  const persistor = await createPersistor(store);
  store.dispatch({type: 'NOOP'});
  await persistor.flush();

expect(storage.getAllKeys()).resolves.toEqual(['persist:myRoot']);

});
