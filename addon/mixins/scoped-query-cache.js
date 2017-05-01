import Ember from 'ember';

export default Ember.Mixin.create({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.cache = {};
  },

  queryRecord() {
    return this.get('store').queryRecord(...arguments);
  },

  query() {
    return this.get('store').query(...arguments);
  },

  findRecord() {
    // Discuss what we need to do here..
    return this.get('store').findRecord(...arguments);
  }
});
