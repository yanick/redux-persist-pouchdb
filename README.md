# Redux Persist PouchDB Adapter

## Install

    npm install redux-persist-pouchdb

## Synopsis

    import PouchDB from 'pouchdb';

    PouchDB.plugin( require( 'pouchdb-adapter-memory' ) );

    import { createStore } from 'redux';
    import { persistStore } from 'redux-persist';

    // IMPORTANT: persistReducer must be imported here, not
    // from 'redux-persist'
    import { persistReducer, PouchDBStorage } from 'redux-persist-pouchdb';

    const storage = new PouchDBStorage( 'test', { adapter: 'memory' } );

    const reducer = function(state={ i: 0 }, action ) {
        if( action.type === 'INC' ) { return { i: 1 + state.i } };
        return state;
    }

    const persistedReducer = persistReducer({ storage, key: 'myRoot' }, reducer );

    const store = createStore( persistedReducer );

    const persistor = persistStore( store, null, () => {
        store.dispatch({ type: INC });
    });

## Description

This package exports two things: the function 
`persistReducer` and the class `PouchDBStorage`.

### persistReducer( persistConfig, rootReducer )

A thin wrapper around `redux-persist`'s own `persistReducer` that
wrap the reducer such that the `_rev`ision of the retrieved document
is saved along the document.

### PouchDBStorage 

Connect to the PouchDB backend.

    const storage = new PouchDBStorage( db_name, { ...pouchDB_options } )
