<template>
    <div></div>
    <transition name="modal">
    <dialog open>
        <header>
            <slot name="header">
                <h2>{{ title }}</h2>
            </slot>
        </header>
        <section>
            <slot></slot>
        </section>
        <menu>
            <slot name="actions"></slot>
        </menu>
    </dialog>
</transition>
</template>

<script>

export default {
    props: ['title']
}

</script>

<style scoped>
div {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.59);

    z-index: 10;
}

dialog {
    position: fixed;
    top: 30vh;
    left: 10%;
    width: 80%;
    z-index: 100;
    border-radius: 15px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    padding: 0;
    margin: 0;
    overflow: hidden;
    background: rgb(255, 255, 255);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    color: rgb(0, 0, 0);
    animation: modal-enter 0.2s ease-in-out forwards;
}

header {
    background-color: #ff0000;
    color: white;
    width: 100%;
    padding: 1rem;
    background: #bb0000;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    color: rgb(255, 255, 255);
}

header h2 {
    margin: 0;
}

section {
    padding: 1rem;

}

menu {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    margin: 0;
    background: rgba(255, 255, 255, 0);
    color: white;

}

@media (min-width: 768px) {
    dialog {
        left: calc(50% - 20rem);
        width: 40rem;
    }
}

.modal-enter-active {
  animation: modal-enter 0.2s ease-in-out forwards;
}
.modal-leave-active {
  animation: modal-leave 0.2s ease-in-out forwards;
}

@keyframes modal-enter {
  0% {
    opacity: 0;
    transform: translateY(-400px)  scale(0.000001);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-leave {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-400px) scale(0.000001);
  }
}
</style>