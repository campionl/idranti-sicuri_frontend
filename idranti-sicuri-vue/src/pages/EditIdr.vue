<template>
    <div id="page_content">
        <TheHeader title="Modifica di un idrante" />
        <hr>
        <formIdr type="edit"/>
    </div>
</template>
<script>

export default {
  name: 'EditIdr',
  props: {
    id: { type: String, required: false }
  }
}
</script>

<style scoped>
body {
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>