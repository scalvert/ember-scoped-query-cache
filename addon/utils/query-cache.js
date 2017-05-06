
const CACHE_DECAY_TIMEOUT = 5000;

export default class QueryCache {
  constructor() {
    this._internalCache = Object.create(null);
    this.decayId = null;
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
    return Object.keys(this._internalCache);
  }

  scheduleDecay(delay = CACHE_DECAY_TIMEOUT, onDecay) {
    if (this.decayId) {
      this.cancelDecay();
    }

    this.decayId = setTimeout(() => {
      this._internalCache = Object.create(null);
      this.decayId = null;

      onDecay && typeof onDecay === 'function' && onDecay();
    }, delay);
  }

  cancelDecay() {
    clearTimeout(this.decayId);
    this.decayId = null;
  }

  destroy() {
    clearTimeout(this.decayId);
    this._internalCache = null;
    this.decayId = null;
  }
}
