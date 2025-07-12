<template>
    <div id="page_content">
        <TheHeader title="Segnalzione di un idrante" />
        <hr>
        <div id="tables">
            <div id="left-column">
                <BaseCard>
                <table class="ins_table" id="info_table">
                    <tr>
                        <td class="keys">Latitudine</td>
                        <td class="vals">
                            <BaseInput id="info_id_lat" type="text" v-model="latitudine.value" @blur="clearValidation('latitudine')" :isValid="latitudine.isValid" errorMsg="La latitudine è obbligatoria." />
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Longitudine</td>
                        <td class="vals">
                            <BaseInput id="info_id_lon" type="text" v-model="longitudine.value" @blur="clearValidation('longitudine')" :isValid="longitudine.isValid" errorMsg="La longitudine è obbligatoria." />
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Immagini</td>
                        <td class="vals">
                            <BaseInput type="file" id="insert_img" name="immagini" accept=".jpeg,.jpg,.png" multiple
                                @change="previewImages(event)" placeholder="imgs_input" title="Carica immagini"
                                aria-label="Carica immagini" style="display: none;"/>
                            <label for="insert_img" class="btn btn-secondary" id="upload_label">Carica immagini</label>
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Operativo</td>
                        <td class="vals">
                            <div style="display: flex; flex-direction: row; align-items: center; gap: 1.5em;">
                                <label style="display: flex; align-items: center; gap: 0.3em;"><input  type="radio" name="operativo" id="operative" value="si" v-model="operativo.value" @blur="clearValidation('operativo')" /> Sì</label>
                                <label style="display: flex; align-items: center; gap: 0.3em;"><input type="radio" name="operativo" id="n_operative" value="no" v-model="operativo.value" @blur="clearValidation('operativo')" /> No</label>
                                <label style="display: flex; align-items: center; gap: 0.3em;"><input type="radio" name="operativo" id="unk_operative" value="no" v-model="operativo.value" @blur="clearValidation('operativo')" /> Non lo so</label>
                            </div>
                            <p v-if="!operativo.isValid" style="color: red; font-size: 0.9em; margin: 0.2em 0 0 0;">Seleziona lo stato operativo.</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Campo 1</td>
                        <td class="vals">
                            <BaseInput id="camp_1" type="text" v-model="camp1.value" @blur="clearValidation('camp1')" :isValid="camp1.isValid" errorMsg="Campo 1 obbligatorio." />
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Campo 2</td>
                        <td class="vals">
                            <BaseInput id="camp_2" type="text" v-model="camp2.value" @blur="clearValidation('camp2')" :isValid="camp2.isValid" errorMsg="Campo 2 obbligatorio." />
                        </td>
                    </tr>
                    <tr>
                        <td class="keys">Campo 3</td>
                        <td class="vals">
                            <BaseInput id="camp_3" type="text" v-model="camp3.value" @blur="clearValidation('camp3')" :isValid="camp3.isValid" errorMsg="Campo 3 obbligatorio." />
                        </td>
                    </tr>
                </table>
                
                <div id="form-buttons">
                    <router-link to="/" class=" btn-secondary">Annulla</router-link>
                    <button id="conferma" class="btn-primary" @click="insert_data">Conferma</button>
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
    components: {
        Map
    },
    data() {
        return {
            imgs: [],
            operativo: { value: '', isValid: true },
            latitudine: { value: '', isValid: true },
            longitudine: { value: '', isValid: true },
            camp1: { value: '', isValid: true },
            camp2: { value: '', isValid: true },
            camp3: { value: '', isValid: true },
        }
    },
    watch: {
        'latitudine.value': 'updatePreviewMarker',
        'longitudine.value': 'updatePreviewMarker',
    },
    methods: {
        previewImages(event) {
            const preview = document.getElementById('preview');
            preview.innerHTML = '';

            const files = event.target.files;
            if (!files) return;

            // limite 3 file
            const maxFiles = 3;
            if (files.length > maxFiles) {
                alert(`Puoi caricare al massimo ${maxFiles} immagini.`);
                event.target.value = ''; // Resetta l'input file
                return;
            }

            // controllo tipo file
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            Array.from(files).forEach(file => {
                if (!allowedTypes.includes(file.type)) {
                    console.warn("Formato non supportato:", file.type);
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '60px';
                    img.style.maxHeight = '60px'; 
                    img.style.objectFit = 'cover';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        },
        validateForm() {
            let valid = true;
            if (this.latitudine.value === '') {
                this.latitudine.isValid = false;
                valid = false;
            }
            if (this.longitudine.value === '') {
                this.longitudine.isValid = false;
                valid = false;
            }
            if (this.camp1.value.trim() === '') {
                this.camp1.isValid = false;
                valid = false;
            }
            if (this.camp2.value.trim() === '') {
                this.camp2.isValid = false;
                valid = false;
            }
            if (this.camp3.value.trim() === '') {
                this.camp3.isValid = false;
                valid = false;
            }
            if (this.operativo.value === '') {
                this.operativo.isValid = false;
                valid = false;
            }
            return valid;
        },
        insert_data() {
            if (!this.validateForm()) {
                // Scroll to the first invalid input
                const invalidOrder = [
                  { key: 'latitudine', id: 'info_id_lat' },
                  { key: 'longitudine', id: 'info_id_lon' },
                  { key: 'camp1', id: 'camp_1' },
                  { key: 'camp2', id: 'camp_2' },
                  { key: 'camp3', id: 'camp_3' },
                  { key: 'operativo', id: 'operative' } // fallback to first radio
                ];
                for (const field of invalidOrder) {
                  if (this[field.key] && this[field.key].isValid === false) {
                    const el = document.getElementById(field.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.focus && el.focus();
                    }
                    break;
                  }
                }
                return;
            }
            const coords = [this.latitudine.value, this.longitudine.value];
            const fields = {
                camp1: this.camp1.value,
                camp2: this.camp2.value,
                camp3: this.camp3.value
            };
            this.$refs.map.addPin(coords, this.imgs, this.operativo.value, fields);
            this.$refs.map.flyTo(coords);
            this.$router.push('/');
        },
        clearValidation(field) {
            this[field].isValid = true;
        },
        updatePreviewMarker() {
            const lat = parseFloat(this.latitudine.value);
            const lon = parseFloat(this.longitudine.value);
            if (!isNaN(lat) && !isNaN(lon)) {
                this.$refs.map.setPreviewMarker([lat, lon]);
            } else {
                this.$refs.map.removePreviewMarker();
            }
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
  padding: 0 1vw;
  box-sizing: border-box;
}

#mappa {
    width: 100%;
    height: 100%;
    padding: 0px;
    border-radius: 12px;
}

#select_on_map {
    margin-top: auto;
    margin-bottom: 2.7rem;
    width: 900px;
    height: 600px;
    border-radius: 15px;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);

}

.keys,
.vals {
    padding: 10px;
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

#tables {
    display: flex;
    width: 1500px;
    margin: auto;
    align-items: flex-start;
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

/* Responsive styles for mobile */
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
  .ins_table, #info_table, .base-card {
    width: 95vw !important;
    max-width: 500px;
    margin: 10px auto;
    padding: 8px 4px;
    box-sizing: border-box;
  }
  .keys, .vals {
    display: block;
    width: 100%;
    padding: 8px 4px;
    box-sizing: border-box;
  }
  /* Make Operativo radio buttons wrap or stack */
  .vals > div[style*="display: flex"] {
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
  #info_id, input[type="text"] {
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
    height: 320px !important;
    min-height: 220px;
  }
  #info_table, .base-card {
    margin: 1px auto;
    padding: 1px 0;
    width: 99vw !important;
    max-width: 99vw;
  }
  #form-buttons {
    padding-bottom: 20px;
  }
}
</style>