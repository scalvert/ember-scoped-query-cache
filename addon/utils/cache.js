
export default class Cache {
  constructor() {
    this._internalCache = Object.create(null);
  }

  add(type, key, value) {
    if (!key || !value) {
      return;
    }

    if (!this._internalCache[type]) {
      this._internalCache[type] = Object.create(null);
    }

    this._internalCache[type][key] = value;
  }

  remove(type, key) {
    let typeMap = this._internalCache[type];

    if (typeMap && typeMap[key]) {
      delete typeMap[key];
    }
  }

  clear() {
    this._internalCache = Object.create(null);
  }

  get(type, key) {
    if (!this._internalCache[type]) {
      return;
    }

    return this._internalCache[type][key];
  }

  get types() {
    return Object.keys(this._internalCache).length;
  }
}
