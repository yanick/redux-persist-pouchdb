import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'

import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-adapter-node-websql'));

const debug = require('debug')('pouch');

class ProxyPouch {
    constructor(db,options={}) {
        this._db = new PouchDB(db,options);
    }

    async getItem( key ) {
        const doc = await this._db.get(key);
        debug(">>>",doc);
        if( doc.doc._persist ) {
            doc.doc._persist._rev = doc._rev;
            doc.doc._persist = JSON.stringify(doc.doc._persist);
        }
        debug(doc);
        return JSON.stringify(doc.doc);
    }

    async setItem( key, value ) {
        debug( "set", value );
        const doc = JSON.parse(value);
        doc._persist = JSON.parse(doc._persist);
        return this._db.put({ _id: key, _rev: doc._persist._rev, doc });
    }
}

let storage = new ProxyPouch('./mydb',{ adapter: 'websql' });

const rootReducer = (state={},action) => {
    debug(action);
    debug( "state:", state );
    switch( action.type ) {
        case 'INC': return state.i ? { i: state.i + 1 } : { i : 1 };

        default:
            return state;
    }
}

const persistConfig = {
  key: 'myRoot',
  storage,
}

import { REHYDRATE } from 'redux-persist';

let store;

const r = persistReducer(persistConfig, rootReducer);
const persistedReducer = function(state=undefined,action) {
    let new_state = r(state,action);
    if( action.type === REHYDRATE && new_state._persist && action.payload && action.payload._persist ) {
        new_state._persist._rev = action.payload._persist._rev;
    }
    return new_state;
};

store = createStore(persistedReducer)
let persistor = persistStore(store, null, () => {
    debug(persistor);
    store.dispatch({type:"INC"});
})





