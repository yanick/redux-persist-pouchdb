"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.persistReducer = persistReducer;
exports.PouchDBStorage = void 0;

var _reduxPersist = require("redux-persist");

var _pouchdb = _interopRequireDefault(require("pouchdb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UPDATE_REV = 'persist-pouchdb/UPDATE_REV';

function persistReducer(persistConfig = {}, rootReducer) {
  return (0, _reduxPersist.persistReducer)(persistConfig, function (state = undefined, action) {
    const _rev = state && state._rev;

    state = { ...rootReducer(state, action),
      _rev
    };

    if (action.type === UPDATE_REV) {
      state = { ...state,
        _rev: action.rev
      };
    }

    return state;
  });
}

class PouchDBStorage {
  constructor(db, options = {}) {
    if (typeof db !== 'string' && options == {}) {
      this.db = db;
    } else {
      this.db = new _pouchdb.default(db, options);
    }
  }

  set store(store) {
    this._store = store;
  }

  async getItem(key) {
    const doc = await this.db.get(key);

    if (doc.doc._persist) {
      doc.doc._persist._rev = doc._rev;
      doc.doc._persist = JSON.stringify(doc.doc._persist);
    }

    doc.doc._rev = JSON.stringify(doc._rev);
    return JSON.stringify(doc.doc);
  }

  async setItem(key, value) {
    const doc = JSON.parse(value);

    const _rev = doc._rev && JSON.parse(doc._rev);

    delete doc._rev;

    const _persist = JSON.parse(doc._persist);

    delete doc._persist;
    const result = await this.db.put({
      _id: key,
      _rev,
      doc
    });

    if (this._store) {
      this._store.dispatch({
        type: UPDATE_REV,
        ...result
      });
    }

    return result;
  }

  async removeItem(key, value) {
    const fromDb = await this.db.get(key);
    return this.db.remove(fromDb);
  }

}

exports.PouchDBStorage = PouchDBStorage;