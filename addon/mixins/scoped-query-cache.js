import Ember from 'ember';
import { Cache, sortedObject } from 'ember-scoped-query-cache/utils';
const {
  assert,
  run,
  inject,
  typeOf,
  Mixin
} = Ember;

const CACHE_DECAY_TIMEOUT = 5000;

export default Mixin.create({
  store: inject.service(),

  init() {
    this._super(...arguments);

    this._scopedQueryCache = this._createScopedQueryCache();
  },

  destroy() {
    this.cancelCacheDecay();

    this._super(...arguments);
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

    assert('queryCache needs to be an object', typeOf(queryCache) === 'object');
    return JSON.stringify(sortedObject(queryCache));
  },

  queryCache(modelName, query, options = {}, queryMethod) {
    const { formatCacheKey, shouldCachePredicate } = options;

    /**
     * Convert the object to a string with sorted keys
     * Check if we have a cache hit, and if not, insert into cache
     */
    const cacheReadStringifiedQuery = this.getStringifiedQuery(query, formatCacheKey);
    const cacheHit = this._scopedQueryCache.cache.get(modelName, cacheReadStringifiedQuery);

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
        this._scopedQueryCache.cache.add(modelName, cacheReadStringifiedQuery, queryPromise);
      }

      return results;
    });
  },

  scheduleCacheDecay(delay = CACHE_DECAY_TIMEOUT, callback) {
    if (this._scopedQueryCache.decayId) {
      this.cancelCacheDecay();
    }

    this._scopedQueryCache.decayId = run.later(() => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }

      this._scopedQueryCache = this._createScopedQueryCache();

      callback && typeof callback === 'function' && callback();
    }, delay);
  },

  cancelCacheDecay() {
    run.cancel(this._scopedQueryCache.decayId);
    this._scopedQueryCache.decayId = null;
  },

  _createScopedQueryCache() {
    return {
      cache: new Cache(),
      decayId: null
    };
  }
});
