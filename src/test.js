import PouchDB from 'pouchdb';

PouchDB.plugin( require( 'pouchdb-adapter-memory' ) );

import { createStore } from 'redux';
import { persistStore } from 'redux-persist';
import { persistReducer, PouchDBStorage } from './index';

function createPersistor(store) {
    return new Promise((accept) => {
        try {
            const persistor = persistStore(store,null, () => accept(persistor) );
        }
        catch(e) {
            console.log(e);
        }
    });
}

test( 'basic', async () => {
    const storage = new PouchDBStorage( 'test-basic', { adapter: 'memory' } );

    const reducer = function(state={ i: 0 }, action ) {
        if( action.type === 'INC' ) { return { i: 1 + state.i } };
        return state;
    }

    const persistedReducer = persistReducer({ storage, key: 'myRoot' }, reducer );

    const store = createStore( persistedReducer );

    storage.store = store;

    const persistor = await createPersistor(store);

    const INC = { type: 'INC' };

    store.dispatch(INC);
    store.dispatch(INC);

    expect(store.getState()).toHaveProperty( 'i', 2 );

    await persistor.flush();
    return;

    store.dispatch(INC);
    await persistor.flush();

    expect(store.getState()).toHaveProperty( 'i', 3 );

});

test( 'pass the db directly', async () => {
    const db = new PouchDB( 'test-direct-db', { adapter: 'memory' } );
    const storage = new PouchDBStorage(db);

    const reducer = function(state={ i: 0 }, action ) {
        if( action.type === 'INC' ) { return { i: 1 + state.i } };
        return state;
    }

    const persistedReducer = persistReducer({ storage, key: 'myRoot' }, reducer );

    const store = createStore( persistedReducer );

    const persistor = await createPersistor(store);

    const INC = { type: 'INC' };

    store.dispatch(INC);
    store.dispatch(INC);

    expect(store.getState()).toHaveProperty( 'i', 2 );
});

