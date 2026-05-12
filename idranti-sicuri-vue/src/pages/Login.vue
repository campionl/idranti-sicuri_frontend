<template>
    <div class="login-container">
        <BaseCard>
            <h1>Login</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <BaseInput
                        v-model="email"
                        type="email"
                        id="email"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <BaseInput
                        v-model="password"
                        type="password"
                        id="password"
                        required
                    />
                </div>
                <BaseButton type="submit" class="btn-primary">Accedi</BaseButton>
            </form>
            <p v-if="error" class="error-message">{{ error }}</p>
        </BaseCard>
    </div>
</template>

<script>
import BaseButton from '@/components/bases/BaseButton.vue';
import BaseCard from '@/components/bases/BaseCard.vue';
import BaseInput from '@/components/bases/BaseInput.vue';

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            error: ''
        }
    },
    methods: {
        handleLogin() {
            // Aggiungi logica di autenticazione
            if (this.email && this.password) {
                // Invia credenziali al backend
                console.log('Login:', this.email)
                this.$router.push('/')
            } else {
                this.error = 'Compilare tutti i campi'
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    box-sizing: border-box;
}

.base-card {
    width: 100%;
    max-width: 400px;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-group {
    margin-bottom: 1rem;
}

.btn-primary {
    margin-top: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 100px;
    height: 30px;
}

#page_content {
    width: 100%;
    max-width: 100vw;
    padding: 0;
    box-sizing: border-box;
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
/* Stili responsivi per mobile */
@media (max-width: 1200px) {
    #tables {
        flex-direction: column;
        width: 100%;
        align-items: stretch;
    }

    .base-card {
        width: auto;
        max-width: auto;
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

    #info_id {
        width: 100%;
        min-width: 0;
        font-size: 1rem;
    }

    #page_content {
        padding: 0 2vw;
    }
}

@media (max-width: 600px) {
    #tables {
        flex-direction: column-reverse;
    }


    #info_table,
    .base-card {
        margin: 1px auto;
        padding: 1px 0;
        width: auto;
        max-width: auto;
    }

    #form-buttons {
        padding-bottom: 20px;
    }
}
</style>