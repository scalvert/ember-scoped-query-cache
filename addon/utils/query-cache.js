
const CACHE_DECAY_TIMEOUT = 5000;

export default class QueryCache {
  constructor() {
    this._internalCache = Object.create(null);
    this.decayId = null;
  }

  add(type, key, value) {
   if (!key) {
     throw new Error('You must provide a key to the `add` method when caching a value.');
   }

    key = `${type}!${key}`;

    this._internalCache[key] = value;
  }

  remove(type, key) {
    key = `${type}!${key}`;

    delete this._internalCache[key];
  }

  clear() {
    this._internalCache = Object.create(null);
  }

  get(type, key) {
    key = `${type}!${key}`;

    return this._internalCache[key];
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
