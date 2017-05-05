import { module, test } from 'qunit';
import { Cache } from 'ember-scoped-query-cache/utils';

module('Unit | Utility | cache');

test('Creates cache object with internal map', (assert) => {
  let cache = new Cache();

  assert.ok(cache._internalCache);
});

test('Cache#add skips adding if key is undefined', (assert) => {
  let cache = new Cache();

  cache.add('my-type');

  assert.notOk(cache._internalCache['my-type']);
});

test('Cache#add skips adding if value is undefined', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey');

  assert.notOk(cache._internalCache['my-type']);
});

test('Cache#add adds item to cache when all params specified', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');

  assert.ok(cache._internalCache['my-type']);
  assert.ok(cache._internalCache['my-type']['mykey']);
});

test('Cache#add updates existing value when key present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'mykey', 'mynewvalue');

  assert.equal(cache._internalCache['my-type']['mykey'], 'mynewvalue');
});

test('Cache#remove removes items by key', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(cache._internalCache['my-type']).length, 2);

  cache.remove('my-type', 'mykey');

  assert.equal(Object.keys(cache._internalCache['my-type']).length, 1);
});

test('Cache#remove doesn\'t remove items when type not present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(cache.types, 1);

  cache.remove('other-type', 'mykey');

  assert.equal(cache.types, 1);
});

test('Cache#remove doesn\'t remove items when key not present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(Object.keys(cache._internalCache['my-type']).length, 2);

  cache.remove('my-type', 'randomkey');

  assert.equal(Object.keys(cache._internalCache['my-type']).length, 2);
});

test('Cache#clear removes all items from cache', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');
  cache.add('other-type', 'myotherkey', 'mynewvalue');
  cache.add('random-type', 'myotherkey', 'mynewvalue');

  assert.equal(cache.types, 3);

  cache.clear();

  assert.equal(cache.types, 0);
});

test('Cache#get retrieves item by type when type present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.equal(cache.get('my-type', 'myotherkey'), 'mynewvalue');
});

test('Cache#get does to retrieve item when type not present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.notOk(cache.get('random-type', 'randomkey'));
});

test('Cache#get does to retrieve item when key not present', (assert) => {
  let cache = new Cache();

  cache.add('my-type', 'mykey', 'myvalue');
  cache.add('my-type', 'myotherkey', 'mynewvalue');

  assert.notOk(cache.get('my-type', 'randomkey'));
});
