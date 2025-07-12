<template>
  <div>
    <BaseDialog v-if="!validID" title="ID idrante non valido">
      <template #default>
        <p>ID idrante non valido, inserire un ID idrante valido</p>
      </template>
      <template #actions>
        <base-button class="btn-primary" @click="confirmError" @keydown.enter="confirmError">Ok</base-button>
      </template>
    </BaseDialog>
    <div id="page_content">
      <TheHeader title="Dettagli idrante " />
      <form id="insert_code" @submit.prevent="checkInpID()">
        <h3 style="margin-bottom: 22px">Inserire ID idrante:</h3>
        <input id="IDidr_input" type="text" v-model="input" placeholder="ID idrante">
        <input @click="checkInpID()" type="button" class="btn btn-primary" id="button_conf" value="Conferma">
      </form>
      <hr>  
      <transition name="slide-lr" mode="out-in">
        <div :key="id">
          <table id="info_table">
            <tr>
              <td class="keys">ID</td>
              <td class="vals" id="info_id">{{ id }}</td>
            </tr>
            <tr>
              <td class="keys">Latitudine</td>
              <td class="vals" id="info_lat">{{ details.location_lat }}</td>
            </tr>
            <tr>
              <td class="keys">Longitudine</td>
              <td class="vals" id="info_lon">{{ details.location_lon }} </td>
            </tr>
            <tr>
              <td class="keys">Immagini</td>
              <td class="vals" id="info_imgs">
                <span v-if="details.imgs.length === 0" id="info_img_error">Non è presente nessuna immagine</span>
                <a v-for="img in details.imgs" :key="img" :href="'../assets/' + img" target="_blank"><img :src="'../../assets/' + img" style="height: 150px;"></a>
              </td>
            </tr>
            <tr>
              <td class="keys">Operativo</td>
              <td class="vals" id="info_op">{{ details.operative ? 'Si' : 'No' }}</td>
            </tr>
            <tr v-for="field in Object.keys(details.fields)" :key="field">
              <td class="keys">{{ field }}</td>
              <td class="vals" id="info_c1">{{ details.fields[field] }}</td>
            </tr>
          </table>
          <div id="actionBtn">
            <router-link to="/" class="btn-secondary" :prop="id">Annulla</router-link>
            <router-link :to="`/edit-idr/${id}`" class="btn-primary">Modifica</router-link>
            <router-link :to="`/delete-idr/${id}`" class="btn-primary">Elimina</router-link>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            input: '',
            input_confirm: '',
            validID: true
        }
    },

    name: 'Details',
    props: ['id'],
    computed: {
        details() {
            return this.$store.state.map.pins.find(item => item.id === this.id);
        }
    },
    methods: {
        checkInpID() {
            const ids = this.$store.state.map.pins.map(item => item.id);
            if (this.input !== '' && ids.includes(this.input)) {
                this.$router.push(`/details/${this.input}`);
                this.input = '';
                this.validID = true;
            } else {
                this.validID = false;
                this.input = '';
            }
        },
        confirmError() {
            this.validID = true;
        }
    }
}
</script>

<style scoped>
#insert_code {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
}

#info_table {
    margin: auto;
    border-radius: 15px;
    box-shadow: 15px 15px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid gray;
    border-width: 1px;
    padding: 20px;
    margin-top: 30px;
    position: relative;
}



.keys,
.vals {
    padding: 10px;
}

#IDidr_input {
    border-radius: 15px;
    text-indent: 10px;
    height: 20px;
    border: 1px solid gray;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.15);
}

#page_content {
    margin: 1%;
}

#actionBtn {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

.keys {
    font-weight: bold;
}

/* Responsive styles for mobile */
@media (max-width: 900px) {
  #page_content {
    margin: 0;
    padding: 0 2vw;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }
  #insert_code {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
  }
  #button_conf {
    width: 90vw;
    max-width: 300px;
    font-size: 1.1rem;
    margin: 1.2rem auto 0 auto;
    margin-bottom: 1rem;
    display: block;
    padding: 8px 0;
  }
  #info_table {
    width: 100% !important;
    min-width: 0;
    font-size: 1rem;
    padding: 10px;
  }
  .keys, .vals {
    display: block;
    width: 100%;
    padding: 8px 4px;
    box-sizing: border-box;
  }
  #IDidr_input, input[type="text"] {
    width: 90%;
    min-width: 0;
    font-size: 1rem;
    align-self: center;
  }
  #IDidr_input {
    min-height: 28px;
    padding-top: 4px;
    padding-bottom: 4px;
  }
  #actionBtn {
    flex-direction: column;
    
    gap: 10px;
    width: 100%;
    align-items:  strech;
    text-align: center;
  }
  #actionBtn > *:last-child {
    margin-bottom: 7rem;
  }
}
</style>