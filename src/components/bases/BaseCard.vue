<template>
    <div class="base-card">
        <slot></slot>
    </div>
</template>


<style>
.base-card {
    margin: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    margin: 100px;
    width: 75%;
    height: 100%;
    display: flex;
}
</style>