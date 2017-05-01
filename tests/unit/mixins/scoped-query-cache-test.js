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
      catch: (bar) => (RSVP.Promise.resolve(bar())),
    };

    this.queryRecordStub = this.sandbox.stub().returns(promiseMock);
    this.queryStub = this.sandbox.stub().returns(promiseMock);
    this.storeStub = {
      queryRecord: this.queryRecordStub,
      query: this.queryStub,
    };
  },

  afterEach() {
    this.sandbox.restore();
  }
});

// Replace this with your real tests.
test('queryRecord calls store queryRecord', function(assert) {
  const ScopedQueryCacheObject = Ember.Object.extend(ScopedQueryCacheMixin);
  const subject = ScopedQueryCacheObject.create({
    store: this.storeStub
  });

  const queryParams = { foo: 'abc' };
  subject.queryRecord('foobar', queryParams);

  assert.equal(this.queryRecordStub.getCalls().length, 1);
});

test('query calls store query', function(assert) {
  const ScopedQueryCacheObject = Ember.Object.extend(ScopedQueryCacheMixin);
  const subject = ScopedQueryCacheObject.create({
    store: this.storeStub
  });

  const queryParams = { foo: 'abc' };
  subject.query('foobar', queryParams);

  assert.equal(this.queryStub.getCalls().length, 1);
});
