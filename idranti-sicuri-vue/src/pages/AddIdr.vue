<template>
    <div id="page_content">
        <TheHeader title="Segnalzione di un idrante" />
        <hr>
        <formIdr type="add"/>
    </div>
</template>

<script>
import Map from './Map.vue';
import formIdr from '../components/formIdr.vue';

export default {
    components: {
        Map,
        formIdr
    },
}
</script>