import { createStore } from 'vuex';
import map from './map';
import details from './details';

const store = createStore({
  modules: {
    map,
    details
  }
});

export default store;
