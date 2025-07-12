<template>
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

// Add document title for the app
<script setup>
document.title = 'Idranti - ver Alpha';
</script>


<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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