import { module, test } from 'qunit';
import { QueryCache } from 'ember-scoped-query-cache/utils';

module('Unit | Utility | query-cache');

test('Creates queryCache object with internal map', function (assert) {
  let queryCache = new QueryCache();

  assert.ok(queryCache._internalCache);
});

test('QueryCache#add throws if key is undefined', function(assert) {
  let queryCache = new QueryCache();

  assert.throws(() => {
    queryCache.add('my-type');
  });
});

test('QueryCache#add adds item to queryCache when all params specified', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');

  assert.ok(queryCache._internalCache['my-type!mykey']);
});

test('QueryCache#add updates existing value when key present', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'mykey', 'mynewvalue');

  assert.equal(queryCache._internalCache['my-type!mykey'], 'mynewvalue');
});

test('QueryCache#remove removes items by key', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(queryCache._internalCache).length, 2);

  queryCache.remove('my-type', 'mykey');

  assert.equal(Object.keys(queryCache._internalCache).length, 1);
});

test('QueryCache#remove doesn\'t remove items when key not present', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(queryCache._internalCache).length, 2);

  queryCache.remove('my-type', 'randomkey');

  assert.equal(Object.keys(queryCache._internalCache).length, 2);
});

test('QueryCache#clear removes all items from queryCache', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'myotherkey', 'mynewvalue');
  queryCache.add('other-type', 'myotherkey', 'mynewvalue');
  queryCache.add('random-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(queryCache._internalCache).length, 4);

  queryCache.clear();

  assert.equal(Object.keys(queryCache._internalCache).length, 0);
});

test('QueryCache#get retrieves item by key when key present', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(queryCache.get('my-type', 'myotherkey'), 'mynewvalue');
});

test('QueryCache#get does not retrieve item when key not present', function(assert) {
  let queryCache = new QueryCache();

  queryCache.add('my-type', 'mykey', 'myvalue');
  queryCache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.notOk(queryCache.get('random-type', 'randomkey'));
});

test('QueryCache#scheduleDecay schedules the decay task', function(assert) {
  let done = assert.async();
  let queryCache = new QueryCache();

  queryCache.add('type', 'key', 'value');

  queryCache.scheduleDecay(50, () => {
    assert.equal(Object.keys(queryCache._internalCache).length, 0);
    done();
  });
});

test('cancelDecay correctly cancels the cache decay', function(assert) {
  let done = assert.async();
  let queryCache = new QueryCache();

  queryCache.add('type', 'key', 'value');

  queryCache.scheduleDecay(1000);
  queryCache.cancelDecay();

  setTimeout(() => {
    assert.equal(Object.keys(queryCache._internalCache).length, 1);
    assert.equal(queryCache.get('type', 'key'), 'value');

    done();
  }, 3000);
});
