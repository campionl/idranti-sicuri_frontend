import { createStore } from 'vuex';
import map from './map';

const store = createStore({
  modules: {
    map
  }
});

export default store;