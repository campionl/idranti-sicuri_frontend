<!--
  App.vue — Layout principale dell'applicazione
  - Include la navbar principale (`TheNavBar`) visibile su tutte le pagine
  - Usa `router-view` per rendere il componente associato alla route corrente
  - La `transition` con nome `slide-lr` definisce l'animazione di cambio pagina
  Nota: questo file contiene solo la struttura di alto livello; la registrazione dei
  componenti globali e dello store avviene in `src/main.js`.
-->
<template>
  <!-- Layout principale dell'app:
       - `TheNavBar` è il menu superiore
       - `router-view` rende le pagine e `transition` gestisce la transizione tra le route
  -->
  <TheNavBar />
  <router-view v-slot="{ Component }">
    <transition name="slide-lr" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
import TheNavBar from './components/layouts/TheNavBar.vue';








</script>

// Imposta il titolo del documento per l'app
<script setup>
// In questa sezione script setup impostiamo solo il titolo del documento. Evitiamo
// di aggiungere logica di business qui: il comportamento dell'app è gestito dai
// singoli componenti e dal router/store centralizzati.
document.title = 'Idranti - ver Alpha';
</script>


<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Transizione 'slide-lr'
   - `enter-active` / `leave-active` impostano le proprietà di animazione
   - `enter-from` / `enter-to` definiscono la posizione iniziale/finale per l'entrata
   - `leave-from` / `leave-to` definiscono la posizione iniziale/finale per l'uscita
   Questa transizione crea un effetto di scorrimento orizzontale tra le pagine. */
.slide-lr-enter-active, .slide-lr-leave-active {
  transition: all 0.23s cubic-bezier(0.55, 0, 0.1, 1);
  position: absolute;
  width: 100%;
}
.slide-lr-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-lr-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-lr-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-lr-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>