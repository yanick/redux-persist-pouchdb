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

#### docRevs

Object which keys are the documents known to the object, and the values their
current (as far as the PouchDBStorage knows) revision.

#### async getItem( _key_ )

Retrieves the persisted document based on its key.

#### async setItem( _key_, _value_ )

Save the document to PouchDB.

#### async removeItem( _key_ )

Savagely destroy the document in PouchDB (but doesn't
touch the current state in the Redux store).

#### getAllKeys()

Returns all keys currently used by the _PouchDBStorage_ object.

## Recipes

### Listening to database changes  

It's totally possible to listen to database changes via the 
`db` attribute of the PouchDBStorage object. Keep in mind, however,
that if you get a new revision from the database, you'll have to
update `docRevs` manually to be sure that the new update from 
PouchDBStorage won't result in a conflict.

```
storage.db
    .changes({
        live: true,
        include_docs: true
    })
    .on("change", ({ id, changes, doc }) => {
        // not one of ours, nevermind
        if ( !storage.docRevs[id] ) return;

        // skip if we are the instigators of the change
        if (doc._rev === storage.docRevs[id]) return;

        // manually update the docRevs and tell the
        // store to deal with the change
        storage.docRevs[id] = doc._rev;
        store.dispatch({
            type: "DB_CHANGE",
            payload: doc.doc
        });
    });
```

