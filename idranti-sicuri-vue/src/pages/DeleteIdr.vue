<template>
    <div>
      <TheHeader title="Elimina idrante " />
      <p>Eliminare l'idrante {{ id }}?</p>
      <base-button class="btn-primary" @click="deleteIdr">Elimina</base-button>
      <base-button class="btn-secondary" @click="goBack">Annulla</base-button>
    </div>
  </template>
  
  <script>
  // Pagina 'Elimina idrante': conferma ed esegue la cancellazione dell'idrante.
  // Status: TODO - implementare logica reale di cancellazione
export default {
    name: 'DeleteIdr',
    props: {
        id: {
            type: String,
            required: true
        }
    },
    methods: {
        goBack() {
            // Torna alla pagina dettagli se l'utente annulla
            this.$router.push(`/details/${this.id}`);
        },
        deleteIdr() {
            // Logica per eliminare l'idrante (da implementare)
            // Dopo l'eliminazione, torna alla mappa degli idranti
            this.$router.push('/');
        }
    }
  }
  </script>

  <style scoped>
  div {
    text-align: center;
    margin-top: 100px;
  }

  h2 {
    font-size: 7rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 2rem;
  }

  @media (max-width: 700px) {
    div {
      margin-top: 24px;
      padding: 0 2vw;
      max-width: 98vw;
      margin-left: auto;
      margin-right: auto;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 0.7rem;
      word-break: break-word;
    }
    p {
      font-size: 1.05rem;
      margin-bottom: 2.5rem;
    }
    .btn-primary {
      width: 900vw;
      max-width: 300px;
      font-size: 1.1rem;
      margin: 1.2rem auto 7rem auto;
      display: block;
      padding: 10px 0;
    }
  }
  </style>