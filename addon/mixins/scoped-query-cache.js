import Ember from 'ember';
import { QueryCache, sortedObject } from 'ember-scoped-query-cache/utils';
const {
  assert,
  inject,
  typeOf,
  Mixin
} = Ember;

export default Mixin.create({
  store: inject.service(),

  init() {
    this._super(...arguments);

    this.queryCache = new QueryCache();
  },

  destroy() {
    this.queryCache.destroy();

    this._super(...arguments);
  },

  queryRecord(modelName, query, options = {}) {
    const queryRecordMethod = () => this.get('store').queryRecord(modelName, query);
    return this.getFromCache(modelName, query, options, queryRecordMethod);
  },

  query(modelName, query, options = {}) {
    const queryMethod = () => this.get('store').query(modelName, query);
    return this.getFromCache(modelName, query, options, queryMethod);
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

  getFromCache(modelName, query, options = {}, queryMethod) {
    const { formatCacheKey, shouldCachePredicate } = options;

    /**
     * Convert the object to a string with sorted keys
     * Check if we have a cache hit, and if not, insert into cache
     */
    const cacheReadStringifiedQuery = this.getStringifiedQuery(query, formatCacheKey);
    const cacheHit = this.queryCache.get(modelName, cacheReadStringifiedQuery);

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
        this.queryCache.add(modelName, cacheReadStringifiedQuery, queryPromise);
      }

      return results;
    });
  }
});
