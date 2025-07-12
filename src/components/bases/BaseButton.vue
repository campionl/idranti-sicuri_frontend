<template>
  <button :class="class">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    class: {
      type: String,
      default: ''
    }
  }
}
</script>

<style>

.btn-primary {
    font-weight: bold;
    border-radius: 15px;
    padding: 3px 10px;
    margin: 0 4px;
    cursor: pointer;
    box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-decoration: none;
}

.btn-primary a {
    text-decoration: none;
}

.btn-primary {
    background-color: #ff0000;
    color: white;
    border: none;
    font-style: none;
    text-decoration: none;
}

.btn-primary:disabled {
    background-color: #999999;
    color: #eeeeee;
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
}

.btn-secondary {
    background-color: #ffffff;
    color: #000000;
    border: 1px solid #000000;
    border-radius: 15px;
    padding: 3px 10px;
    margin: 0 4px;
    font-weight: bold;
    font-style: none;
    text-decoration: none;
    color: #000000;
}

.btn-secondary:disabled {
    background-color: #000000;
    color: #aaaaaa;
    border-color: #dddddd;
    border-radius: 15px;
    padding: 3px 10px;
    margin: 0 4px;
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
}

@media (max-width: 700px) {
  .btn-primary, .btn-secondary {
    width: 90vw;
    max-width: 300px;
    font-size: 1.1rem;
    padding: 12px 0;
    margin: 1.2rem auto 0 auto;
    display: block;
    text-align: center;
  }
}

</style>