import { REHYDRATE } from 'redux-persist';
import { persistReducer as originalPR } from 'redux-persist';
import PouchDB from 'pouchdb';

export function persistReducer(persistConfig, rootReducer) {
    const reducer = originalPR(persistConfig, rootReducer);

    return function(state=undefined,action) {
        let new_state = reducer(state,action);

        // all that to add the _rev to the _persist state
        if( action.type === REHYDRATE && new_state._persist && action.payload && action.payload._persist ) {
            new_state._persist._rev = action.payload._persist._rev;
        }

        return new_state;
    };
}

export class PouchDBStorage {

    constructor(db,options={}) {
        this._db = new PouchDB(db,options);
    }

    async getItem( key ) {
        const doc = await this._db.get(key);
        if( doc.doc._persist ) {
            doc.doc._persist._rev = doc._rev;
            doc.doc._persist = JSON.stringify(doc.doc._persist);
        }
        return JSON.stringify(doc.doc);
    }

    async setItem( key, value ) {
        const doc = JSON.parse(value);
        doc._persist = JSON.parse(doc._persist);
        return this._db.put({ _id: key, _rev: doc._persist._rev, doc });
    }

    async removeItem( key, value ) {
        return this._db.remove( await this._db.get(key) );
    }
}
