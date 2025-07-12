<template>  
  <div class="form-control" :class="{ invalid: !isValid }">
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      class="base-input__input"
    />
    <p v-if="!isValid && errorMsg" class="error-msg">{{ errorMsg }}</p>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: String,
    isValid: {
      type: Boolean,
      default: true
    },
    errorMsg: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.form-control {
  margin: 0.15rem 0;
  width: 100%;
  box-sizing: border-box;
}
.form-control.invalid input {
  border: 1px solid red !important;
}
.error-msg {
  color: red;
  font-size: 0.9em;
  margin: 0.2em 0 0 0;
}
.base-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  height: 80%;
  margin: 10px;
}
.base-input__input {
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 8px 12px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  width: 100%;
  border-radius: 10px;
  caret-color: #ff0000;
  box-sizing: border-box;
}
.base-input__input:focus {
  border: 1px solid #ff0000;
}
.base-input__input[type='radio'] {
  accent-color: #ff0000;
}
@media (max-width: 600px) {
  .base-input__input, .form-control {
    width: 94vw !important;
    max-width: 94vw !important;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
  .base-input__input {
    font-size: 1.15rem;
    padding: 14px 12px;
    min-height: 44px;
  }
  .error-msg {
    font-size: 1.05em;
    margin: 0.3em 0 0 0;
  }
  .form-control {
    margin: 0.25rem 0;
  }
}
</style> 