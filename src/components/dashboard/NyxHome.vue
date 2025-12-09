<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'connect',
    'disconnect',
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="text-center" style="width: 500px;">

        <svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" :fill="nyxStore.isConnected ? '#198754' : '#6c757d'" viewBox="0 0 16 16">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41z" />
        </svg>

        <br /><br />

        <button class="btn btn-success w-100" type="button" @click="emit('connect')" v-if="!nyxStore.isConnected">
            Connect
        </button>

        <button class="btn btn-secondary w-100" type="button" @click="emit('disconnect')" v-if="nyxStore.isConnected">
            Disconnect
        </button>

        <br /><br />

    </div>

    <!-- *********************************************************************************************************** -->

    <span class="position-absolute opacity-50" style="bottom: 8px; font-size: 0.9rem;">
        Copyright © 2024-{{ new Date().getFullYear() }} <a href="https://nyxlib.org/" target="_blank">Nyx Lab</a> — <a href="https://odier.xyz/" target="_blank">Jérôme ODIER</a>, <a href="https://lpsc.in2p3.fr/" target="_blank">LPSC</a> / <a href="https://cnrs.fr/" target="_blank">CNRS</a>.
    </span>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

a {
    color: var(--bs-body-color);
    text-decoration: none;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
