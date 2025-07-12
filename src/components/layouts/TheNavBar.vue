<template>
   <nav id="navbar">
    <div id="navbar-left">
        <img src="/assets/icon.png" alt="Logo" id="navbar-logo" />
      <router-link v-if="this.$route.path != '/'" to="/">
        <h1>Idranti Sicuri VR</h1>
      </router-link>
      <h1 v-else>Idranti Sicuri VR</h1>
    </div>
    <div id="navbar-right" v-if="$route.path !== '/add-idr'"><router-link style="text-decoration: none;" to="/add-idr"><BaseButton  class="btn-primary">Segnala idrante</BaseButton></router-link></div>
  </nav>
</template>

<script></script>

<style scoped>
/* navbar */
#navbar {
    height: 5vh;
    background-color: #bb0000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
}

#navbar-left {
    font-weight: bold;
    color: #f0f0f0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

#navbar-left a {
    position: relative;
    text-decoration: none;
    color: #f0f0f0;
}

#navbar-right {
    display: flex;
    justify-content: center;
    align-items: center;
}

#navbar-logo {
    height: 2rem;
    width: auto;
    margin-left: 0.1rem;
}

@media (max-width: 700px) {
  #navbar {
    flex-direction: column;
    height: auto;
    padding: 0.5rem 0.2rem;
    align-items: stretch;
  }
  #navbar-left, #navbar-right {
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  #navbar-left h1 {
    font-size: 1.3rem;
    margin: 0.5rem 0;
  }
  #navbar-right {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  #navbar-left a, #navbar-left h1 {
    width: 100%;
    display: block;
  }
  .btn-primary {
    width: 80vw;
    max-width: 220px;
    font-size: 0.95rem;
    padding: 7px 0;
    margin: 0 auto;
    display: block;
  }
}
</style>