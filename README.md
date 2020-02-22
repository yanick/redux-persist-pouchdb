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

    const storage = new PouchDBStorage(pouchdb);

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

    const persistor = persistStore( store, null, () => {
        store.dispatch({ type: INC });
    });

## Description

This package exports the class `PouchDBStorage`.

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

#### async getItem( _key_ )

Retrieves the persisted document based on its key.

#### async setItem( _key_, _value_ )

Save the document to PouchDB.

#### async removeItem( _key_ )

Savagely destroy the document in PouchDB (but doesn't
touch the current state in the Redux store).

#### getAllKeys()

Returns all keys currently used by the _PouchDBStorage_ object.
