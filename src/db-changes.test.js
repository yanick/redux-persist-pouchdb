import PouchDB from "pouchdb";

PouchDB.plugin(require("pouchdb-adapter-memory"));

import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import PouchDBStorage from "./index";

const sampleReducer = function(state = { i: 0 }, action) {
  if (action.type === "DB_CHANGE") return action.payload;

  if (action.type === "INC") {
    return { i: 1 + state.i };
  }

  return state;
};

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

test("db updates", async () => {
  const storage = new PouchDBStorage("test-basic", { adapter: "memory" });

  const persistedReducer = persistReducer(
    { storage, key: "myRoot" },
    sampleReducer
  );

  const store = createStore(persistedReducer);

  const persistor = await createPersistor(store);

  const seenChange = new Promise(resolve => {
    storage.db
      .changes({
        live: true,
        include_docs: true
      })
      .on("change", ({ id, changes, doc }) => {
        if (id !== "persist:myRoot") return;

        // skip if we are the instigators of the change
        if (doc._rev === storage.docRevs[id]) return;

        storage.docRevs[id] = doc._rev;
        store.dispatch({
          type: "DB_CHANGE",
          payload: doc.doc
        });
        resolve();
      });
  });

  const INC = { type: "INC" };

  store.dispatch(INC);
  store.dispatch(INC);

  expect(store.getState()).toHaveProperty("i", 2);

  await persistor.flush();

  const doc = await storage.db.get("persist:myRoot");

  expect(doc.doc).toHaveProperty("i", "2");

  await storage.db.put({ ...doc, doc: { i: "123" } });

  await seenChange;

  expect(store.getState()).toHaveProperty("i", "123");
});
