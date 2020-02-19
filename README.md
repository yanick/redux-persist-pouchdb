# Redux Persist PouchDB Adapter

## Install

    npm install redux-persist-pouchdb

## Synopsis

    import PouchDB from 'pouchdb';

    import { createStore } from 'redux';

    import { persistStore, persistReducer } from 'redux-persist';
    import PouchDBStorage from 'redux-persist-pouchdb';

    // the usual PouchDB stuff
    PouchDB.plugin( require( 'pouchdb-adapter-memory' ) );
    const pouchdb = new PouchDB( 'test', { adapter: 'memory' } );


    // your regular reducer
    const reducer = function( state={ i: 0 }, action ) {
        if( action.type === 'INC' ) { return { i: 1 + state.i } };
        return state;
    }

    const persistedReducer = persistReducer(
        { storage, key: 'myRoot' }, 
        reducer 
    );

    const store = createStore( persistedReducer );
    storage.store = store;

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

    const storage = new PouchDBStorage( db_name, { ...pouchDB_options } );

    // or

    const pouchdb = new PouchDB( db_name, { ...options } );
    const storage  = new PouchDBStorage( pouchdb );

The `PouchDBStorage` object has the following attributes and methods:

#### db

    const doc = storage.db.get({ id: 'my_doc' });

The underlying PouchDB object.

#### getItem( *key* )

Retrieves the persisted document based on its key.

#### setItem( *key*, *value* )

Save the document to PouchDB.

#### removeItem( *key* )

Savagely destroy the document in PouchDB (but doesn't 
touch the current state in the Redux store).



