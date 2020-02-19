"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PouchDBStorage = void 0;

var _pouchdb = _interopRequireDefault(require("pouchdb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PouchDBStorage {
  constructor(db, options = {}) {
    if (typeof db !== 'string' && options == {}) {
      this.db = db;
    } else {
      this.db = new _pouchdb.default(db, options);
    }

    this.docRevs = {};
  }

  async getItem(key) {
    const doc = await this.db.get(key);
    this.docRevs[key] = doc._rev;
    return JSON.stringify(doc.doc);
  }

  async setItem(key, value) {
    const doc = JSON.parse(value);
    const _rev = this.docRevs[key];
    const result = await this.db.put({
      _id: key,
      _rev,
      doc
    });
    this.docRevs[key] = result.rev;
    return result;
  }

  async removeItem(key, value) {
    await this.db.remove({
      _id: key,
      _rev: this.docRevs[keys]
    });
    delete this.docRevs[key];
  }

}

exports.PouchDBStorage = PouchDBStorage;