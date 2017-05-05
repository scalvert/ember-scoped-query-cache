import Ember from 'ember';
import sinon from 'sinon';
import ScopedQueryCacheMixin from 'ember-scoped-query-cache/mixins/scoped-query-cache';
import { module, test } from 'qunit';

const { RSVP } = Ember;

module('Unit | Mixin | scoped query cache', {
  beforeEach() {
    this.sandbox = sinon.sandbox.create();
    /**
     * Make promises synchronous for testing purpose.
     * We still have to wrap the objects in Promise so that chained calls `.catch` after `.then` works
     * The alternative is to wrap queryRecord in `.then` chains within each test
     */
    const promiseMock = {
      then: (foo) => (RSVP.Promise.resolve(foo())),
      catch: (bar) => (RSVP.Promise.resolve(bar()))
    };

    this.queryRecordStub = this.sandbox.stub().returns(promiseMock);
    this.queryStub = this.sandbox.stub().returns(promiseMock);
    this.storeStub = {
      queryRecord: this.queryRecordStub,
      query: this.queryStub
    };

    const scopedQueryCacheObject = Ember.Object.extend(ScopedQueryCacheMixin);
    this.subject = scopedQueryCacheObject.create({
      store: this.storeStub
    });
  },

  afterEach() {
    this.sandbox.restore();
  }
});

test('queryRecord calls store queryRecord', function(assert) {
  const queryParams = { foo: 'abc' };
  this.subject.queryRecord('foobar', queryParams);

  assert.equal(this.queryRecordStub.getCalls().length, 1);
});

test('query calls store query', function(assert) {
  const subject = this.subject;
  const queryParams = { foo: 'abc' };
  subject.query('foobar', queryParams);

  assert.equal(this.queryStub.getCalls().length, 1);
});

test('cache miss calls queryRecord twice', function(assert) {
  const subject = this.subject;
  const queryParams = { foo: 'abc' };
  const cacheMissQueryParams = { foo: 'abcd' };

  subject.queryRecord('foobar', queryParams);
  subject.queryRecord('foobar', cacheMissQueryParams);

  assert.equal(this.queryRecordStub.getCalls().length, 2);
});

test('cache hit calls queryRecord once', function(assert) {
  assert.expect(1);
  const subject = this.subject;
  const query = { a: '1' };

  subject.queryRecord('foo', query);
  subject.queryRecord('foo', query);
  subject.queryRecord('foo', query);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    1,
    'cache hit only executes queryRecord once'
  );
});

test('query object order does not matter', function(assert) {
  assert.expect(1);
  const subject = this.subject;
  const firstQuery = { firstArg: 'foooooooo', secondArg: 'barrrrrrrr' };
  const secondQuery = { secondArg: 'barrrrrrrr', firstArg: 'foooooooo' };
  subject.queryRecord('foo', firstQuery);
  subject.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    1,
    'cache hit only executes queryRecord once'
  );
});

test('formatCacheKey is called on query', function(assert) {
  assert.expect(1);

  const subject = this.subject;
  const firstQuery = { firstArg: 'fooo', secondArg: 'barr' };
  const secondQuery = { firstArg: 'fooo', secondArg: 'barr' };
  const formatCacheKey = (queryParams) => (
    Object
      .keys(queryParams)
      .reduce((finalObj, key) => {
        const val = queryParams[key];
        finalObj[key] = val.toUpperCase();
        return finalObj;
      }, {})
  );

  subject.queryRecord('foo', firstQuery, { formatCacheKey });
  subject.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    2,
    'formatCacheKey should convert vales to uppercase and result in cache miss'
  );
});

test('if shouldCachePredicate is false, do not insert into cache', function(assert) {
  assert.expect(1);

  const subject = this.subject;
  const shouldCachePredicate = () => false;
  const firstQuery = { firstArg: 'foo', secondArg: 'bar' };
  const secondQuery = { firstArg: 'foo', secondArg: 'bar' };

  subject.queryRecord('foo', firstQuery, { shouldCachePredicate });
  subject.queryRecord('foo', secondQuery);

  assert.equal(
    this.queryRecordStub.getCalls().length,
    2,
    'shouldCachePredicate should make sure nothing is in cache'
  );
});

// test('findRecord is supported');
// test('failed promise is handled properly')

test('scheduleCacheDecay schedules the decay task', function(assert) {
  let done = assert.async();

  this.subject._scopedQueryCache.cache.add('type', 'key', 'value');

  this.subject.scheduleCacheDecay(50, () => {
    assert.equal(this.subject._scopedQueryCache.cache.types.length, 0);
    done();
  });
});

test('cancelDecay correctly cancels the cache decay', function(assert) {
  let done = assert.async();

  this.subject._scopedQueryCache.cache.add('type', 'key', 'value');

  this.subject.scheduleCacheDecay(1000);
  this.subject.cancelCacheDecay();

  setTimeout(() => {
    assert.equal(this.subject._scopedQueryCache.cache.types.length, 1);
    assert.equal(this.subject._scopedQueryCache.cache.get('type', 'key'), 'value');

    done();
  }, 3000);
});
