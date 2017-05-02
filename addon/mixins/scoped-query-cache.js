import Ember from 'ember';
import sortedObject from 'ember-scoped-query-cache/utils/sorted-object';
const { assert } = Ember;

const CACHE_DECAY_TIMEOUT = 5000;

export default Ember.Mixin.create({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);

    this.cache = this._createCache();
  },

  queryRecord(modelName, query, options = {}) {
    const queryRecordMethod = () => this.get('store').queryRecord(modelName, query);
    return this.queryCache(modelName, query, options, queryRecordMethod);
  },

  query(modelName, query, options = {}) {
    const queryMethod = () => this.get('store').query(modelName, query);
    return this.queryCache(modelName, query, options, queryMethod);
  },

  findRecord() {
    // TODO: Discuss what we need to do here..
    return this.get('store').findRecord(...arguments);
  },

  getStringifiedQuery(query, formatCacheKey) {
    const queryCache = typeof(formatCacheKey) === 'function' ?
          formatCacheKey(query) :
          query;

    assert('queryCache needs to be an object', Ember.typeOf(queryCache) === 'object');
    return JSON.stringify(sortedObject(queryCache));
  },

  queryCache(modelName, query, options = {}, queryMethod) {
    const { formatCacheKey, shouldCachePredicate } = options;
    /**
     * Let's assume modelName = 'foobar'
     * The initial state for `this.cache` is {}
     * We need to insert into cache resulting in
     * cache = { 'foobar': {} }
     */
    if (!this.cache[modelName]) {
      this.cache[modelName] = {};
    }

    /**
     * Convert the object to a string with sorted keys
     * Check if we have a cache hit, and if not, insert into cache
     */
    const cacheReadStringifiedQuery = this.getStringifiedQuery(query, formatCacheKey);
    const queriesForModel = this.cache[modelName];
    const cacheHit = queriesForModel[cacheReadStringifiedQuery];

    if (cacheHit) {
      return cacheHit;
    }

    const queryPromise = queryMethod();

    // TODO: need to consider what to do if this promise fails
    return queryPromise.then(results => {
      const shouldCache = typeof(shouldCachePredicate) === 'function' ?
        shouldCachePredicate(query, results) :
        true;
      assert('shouldCache needs to be a boolean value', typeof(shouldCache) === 'boolean');

      if (shouldCache) {
        queriesForModel[cacheReadStringifiedQuery] = queryPromise;
      }

      return results;
    });
  },

  scheduleCacheDecay(delay = CACHE_DECAY_TIMEOUT, callback) {
    this.decayId = setTimeout(() => {
      this.cache = this._createCache();

      callback && typeof callback === 'function' && callback();
    }, delay);
  },

  cancelCacheDecay() {
    clearTimeout(this.decayId);
  },

  _createCache() {
    return Object.create(null);
  }
});
