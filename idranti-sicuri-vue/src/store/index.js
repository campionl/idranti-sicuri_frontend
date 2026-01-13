// Store Vuex principale: qui registriamo i moduli (map, details).
// I moduli contengono lo stato dell'app correlato alla mappa e ai dettagli degli idranti.
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
