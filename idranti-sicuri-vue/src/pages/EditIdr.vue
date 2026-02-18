<template>
  <div id="page_content">
    <TheHeader title="Modifica idrante" />
    <hr>
    <div id="tables">
      <div id="left-column">
        <BaseCard>
          <table class="ins_table" id="info_table">
            <tr>
              <td class="keys">Latitudine</td>
              <td class="vals">
                <BaseInput id="info_id_lat" type="text" v-model="latitudine.value" @blur="clearValidation('latitudine')"
                  :isValid="latitudine.isValid" errorMsg="La latitudine è obbligatoria." />
              </td>
            </tr>
            <tr>
              <td class="keys">Longitudine</td>
              <td class="vals">
                <BaseInput id="info_id_lon" type="text" v-model="longitudine.value"
                  @blur="clearValidation('longitudine')" :isValid="longitudine.isValid"
                  errorMsg="La longitudine è obbligatoria." />
              </td>
            </tr>
            <tr>
              <td class="keys">Immagini</td>
              <td class="vals">
                <BaseInput type="file" id="insert_img" name="immagini" accept=".jpeg,.jpg,.png" multiple
                  @change="previewImages($event)" placeholder="imgs_input" title="Carica immagini"
                  aria-label="Carica immagini" style="display: none;" />
                <label for="insert_img" class="btn btn-secondary" id="upload_label">Carica immagini</label>
                <div class="image-previews">
                  <div v-for="(item, idx) in combinedPreviews" :key="'comb-' + idx" class="preview-item">
                    <img :src="item.src"
                      :alt="item.type === 'exist' ? 'immagine esistente' : 'anteprima nuova immagine'" />
                    <button type="button" class="remove-btn" @click="removeCombined(idx)">✕</button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="keys">Operativo</td>
              <td class="vals">
                <div style="display: flex; flex-direction: row; align-items: center; gap: 1.5em;">
                  <label style="display: flex; align-items: center; gap: 0.3em;"><input type="radio" name="operativo"
                      id="operative" value="si" v-model="operativo.value" @blur="clearValidation('operativo')" />
                    Sì</label>
                  <label style="display: flex; align-items: center; gap: 0.3em;"><input type="radio" name="operativo"
                      id="n_operative" value="no" v-model="operativo.value" @blur="clearValidation('operativo')" />
                    No</label>
                  <label style="display: flex; align-items: center; gap: 0.3em;"><input type="radio" name="operativo"
                      id="unk_operative" value="unknown" v-model="operativo.value"
                      @blur="clearValidation('operativo')" /> Non lo so</label>
                </div>
                <p v-if="!operativo.isValid" style="color: red; font-size: 0.9em; margin: 0.2em 0 0 0;">Seleziona lo
                  stato operativo.</p>
              </td>
            </tr>
            <tr>
              <td class="keys">Campo 1</td>
              <td class="vals">
                <BaseInput id="camp_1" type="text" v-model="camp1.value" @blur="clearValidation('camp1')"
                  :isValid="camp1.isValid" errorMsg="Campo 1 obbligatorio." />
              </td>
            </tr>
            <tr>
              <td class="keys">Campo 2</td>
              <td class="vals">
                <BaseInput id="camp_2" type="text" v-model="camp2.value" @blur="clearValidation('camp2')"
                  :isValid="camp2.isValid" errorMsg="Campo 2 obbligatorio." />
              </td>
            </tr>
            <tr>
              <td class="keys">Campo 3</td>
              <td class="vals">
                <BaseInput id="camp_3" type="text" v-model="camp3.value" @blur="clearValidation('camp3')"
                  :isValid="camp3.isValid" errorMsg="Campo 3 obbligatorio." />
              </td>
            </tr>
          </table>

          <div id="form-buttons">
            <router-link :to="`/details/${id}`" class=" btn-secondary">Annulla</router-link>
            <button id="conferma" class="btn-primary" @click="update_data">Salva</button>
          </div>
        </BaseCard>
      </div>

      <table class="ins_table" id="select_on_map">
        <tr>
          <td>
            <Map type="add-idr" ref="map" @coords-selected="onCoordsSelected" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Map from './Map.vue';

export default {
  name: 'EditIdr',
  components: { Map },
  props: {
    id: { type: String, required: false }
  },
  data() {
    return {
      imgs: [],
      newPreviewUrls: [],
      newFiles: [],
      operativo: { value: '', isValid: true },
      latitudine: { value: '', isValid: true },
      longitudine: { value: '', isValid: true },
      camp1: { value: '', isValid: true },
      camp2: { value: '', isValid: true },
      camp3: { value: '', isValid: true },
      loadedId: null
    }
  },
  computed: {
    currentId() {
      return this.id || (this.$route && this.$route.params && this.$route.params.id);
    }
    ,
    combinedPreviews() {
      const exist = Array.isArray(this.imgs) ? this.imgs.map(i => ({ type: 'exist', src: this.getImageUrl(i) })) : [];
      const neu = Array.isArray(this.newPreviewUrls) ? this.newPreviewUrls.map(p => ({ type: 'new', src: p })) : [];
      return exist.concat(neu);
    }
  },
  watch: {
    'latitudine.value': 'updatePreviewMarker',
    'longitudine.value': 'updatePreviewMarker',
  },
  mounted() {
    this.prefillFromStore();
  },
  methods: {
    prefillFromStore() {
      const id = this.currentId;
      if (!id) return;
      const pin = this.$store.state.map.pins.find(p => p.id === id);
      if (!pin) return;
      this.loadedId = id;
      this.latitudine.value = pin.location_lat;
      this.longitudine.value = pin.location_lon;
      // La mappa si aspetta valori 'si'/'no'/'unknown'; convertiamo da booleano
      if (pin.operative === true) this.operativo.value = 'si';
      else if (pin.operative === false) this.operativo.value = 'no';
      else this.operativo.value = 'unknown';
      // I campi potrebbero avere nomi diversi; proviamo varianti
      this.camp1.value = (pin.fields && (pin.fields.campo1 || pin.fields.camp1)) || '';
      this.camp2.value = (pin.fields && (pin.fields.campo2 || pin.fields.camp2)) || '';
      this.camp3.value = (pin.fields && (pin.fields.campo3 || pin.fields.camp3)) || '';
      this.imgs = Array.isArray(pin.imgs) ? pin.imgs.slice(0, 3) : [];
      // Posiziona l'anteprima marker sulla mappa
      if (this.$refs.map) this.$refs.map.setPreviewMarker([pin.location_lat, pin.location_lon]);
    },
    previewImages(event) {
      const files = event.target.files;
      if (!files) return;
      const maxTotal = 3;
      const existing = Array.isArray(this.imgs) ? this.imgs.length : 0;
      const currentNew = Array.isArray(this.newPreviewUrls) ? this.newPreviewUrls.length : 0;
      if (files.length + existing + currentNew > maxTotal) {
        alert(`Puoi avere al massimo ${maxTotal} immagini totali.`);
        event.target.value = '';
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      let invalidFiles = [];
      Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(file.name || file.type);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newPreviewUrls.push(e.target.result);
          this.newFiles.push(file);
        };
        reader.readAsDataURL(file);
      });

      if (invalidFiles.length) {
        alert('File non valido: ' + invalidFiles.join(', ') + '. I file supportati sono jpeg, jpg, png.');
        event.target.value = '';
      }
    },

    getImageUrl(img) {
      if (!img) return '';
      if (typeof img !== 'string') return '';
      if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/')) return img;
      return `/assets/${img}`;
    },

    removeExistingImage(idx) {
      if (idx < 0 || idx >= this.imgs.length) return;
      this.imgs.splice(idx, 1);
    },

    removeNewPreview(idx) {
      if (idx < 0 || idx >= this.newPreviewUrls.length) return;
      this.newPreviewUrls.splice(idx, 1);
      this.newFiles.splice(idx, 1);
      const input = document.getElementById('insert_img');
      if (input) input.value = '';
    },
    removeCombined(idx) {
      const existCount = Array.isArray(this.imgs) ? this.imgs.length : 0;
      if (idx < existCount) this.removeExistingImage(idx);
      else this.removeNewPreview(idx - existCount);
    },
    validateForm() {
      let valid = true;
      if (this.latitudine.value === '') { this.latitudine.isValid = false; valid = false; }
      if (this.longitudine.value === '') { this.longitudine.isValid = false; valid = false; }
      if (this.camp1.value.trim() === '') { this.camp1.isValid = false; valid = false; }
      if (this.camp2.value.trim() === '') { this.camp2.isValid = false; valid = false; }
      if (this.camp3.value.trim() === '') { this.camp3.isValid = false; valid = false; }
      if (this.operativo.value === '') { this.operativo.isValid = false; valid = false; }
      return valid;
    },
    update_data() {
      if (!this.validateForm()) return;
      const lat = parseFloat(String(this.latitudine.value).replace(',', '.'));
      const lon = parseFloat(String(this.longitudine.value).replace(',', '.'));
      if (isNaN(lat) || isNaN(lon)) {
        if (isNaN(lat)) this.latitudine.isValid = false;
        if (isNaN(lon)) this.longitudine.isValid = false;
        return;
      }
      const id = this.loadedId || this.currentId;
      const idx = this.$store.state.map.pins.findIndex(p => p.id === id);
      if (idx === -1) { alert('Idrante non trovato nello store'); return; }
      // Aggiorna in loco seguendo lo stile esistente del progetto
      const operativeBool = this.operativo.value === 'si' ? true : (this.operativo.value === 'no' ? false : null);
      this.$store.state.map.pins[idx].location_lat = lat;
      this.$store.state.map.pins[idx].location_lon = lon;
      this.$store.state.map.pins[idx].imgs = this.imgs;
      this.$store.state.map.pins[idx].operative = operativeBool;
      this.$store.state.map.pins[idx].fields = {
        campo1: this.camp1.value,
        campo2: this.camp2.value,
        campo3: this.camp3.value
      };
      // Aggiorna la vista della mappa e torna ai dettagli
      if (this.$refs.map) this.$refs.map.loadPins();
      this.$router.push(`/details/${id}`);
    },
    clearValidation(field) { this[field].isValid = true; },
    updatePreviewMarker() {
      const lat = parseFloat(String(this.latitudine.value).replace(',', '.'));
      const lon = parseFloat(String(this.longitudine.value).replace(',', '.'));
      if (!isNaN(lat) && !isNaN(lon)) this.$refs.map && this.$refs.map.setPreviewMarker([lat, lon]);
      else this.$refs.map && this.$refs.map.removePreviewMarker();
    },
    onCoordsSelected(coords) {
      this.latitudine.value = coords[0].toFixed(6);
      this.longitudine.value = coords[1].toFixed(6);
    }
  }
}
</script>

<style scoped>
body {
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}


#tables {
  display: flex;
  width: 1500px;
  margin: auto;
  align-items: center;
}

#page_content {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  box-sizing: border-box;
}

#mappa {
  width: 100%;
  height: 100%;
  padding: 0px;
  border-radius: 12px;
}

#select_on_map {
  width: 900px;
  height: 600px;
  border-radius: 15px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.keys,
.vals {
  padding: 6px;
}

.keys {
  font-weight: bold;
}

#info_id {
  margin: 10px;
  border-radius: 15px;
  text-indent: 10px;
}

#form-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

#left-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#upload_label {
  font-weight: normal;
}

/* RIMOSSO: .form-control, .form-control.invalid, .error-msg */
input[type='radio'] {
  accent-color: #ff0000;
}

/* Stili responsivi per mobile */
@media (max-width: 1200px) {
  #tables {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }

  #left-column {
    width: 100%;
    align-items: center;
    display: flex;
    flex-direction: column;
  }

  .ins_table,
  #info_table,
  .base-card {
    width: 95vw !important;
    max-width: 500px;
    margin: 10px auto;
    padding: 8px 4px;
    box-sizing: border-box;
  }

  .keys,
  .vals {
    display: block;
    width: 100%;
    padding: 8px 4px;
    box-sizing: border-box;
  }

  /* Consenti ai pulsanti radio Operativo di andare a capo o impilarsi */
  .vals>div[style*="display: flex"] {
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.7em 1.5em;
  }

  .vals label {
    min-width: 80px;
    margin-bottom: 4px;
  }

  #form-buttons {
    flex-direction: column;
    gap: 10px;
    width: 100%;
    position: sticky;
    bottom: 0;
    background: #fff;
    z-index: 2;
    padding-bottom: 10px;
  }

  #info_id,
  input[type="text"] {
    width: 100%;
    min-width: 0;
    font-size: 1rem;
  }

  #mappa {
    width: 100% !important;
    height: 200px !important;
    min-height: 120px;
  }

  #page_content {
    padding: 0 2vw;
  }
}

@media (max-width: 600px) {
  #tables {
    flex-direction: column-reverse;
  }

  #select_on_map {
    height: 160px;
    /* margin-bottom: 1.2rem; */
  }

  #mappa {
    height: 320px;
    min-height: 220px;
  }

  #info_table,
  .base-card {
    margin: 1px auto;
    padding: 1px 0;
    width: 99vw;
    max-width: 99vw;
  }

  #form-buttons {
    padding-bottom: 20px;
  }
}

.image-previews {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.image-previews .preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  flex: 0 0 100px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.image-previews .preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-previews .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
}
</style>