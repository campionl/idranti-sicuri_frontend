<template>
    <header>
        <h1>{{ title }}</h1>  
    </header>
</template>

<script>
export default {
    name: 'TheHeader',
    props: {
        title: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
header {
    text-align: center;
    margin-bottom: 20px;
    font-size: 1.2rem;
}
</style>