<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, onMounted, onUnmounted} from 'vue';

import {Modal} from 'bootstrap/dist/js/bootstrap.esm';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../../stores/indi';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');

/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    deviceName: {
        type: String,
        default: '',
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const openModal = () => {

    const modalEl = document.getElementById('indi_console');

    Modal.getOrCreateInstance(modalEl).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const setupAndUpdateTerminal = () => {

    const terminalEl = document.getElementById('indi_terminal');

    indi.setupTerminal(terminalEl, props.deviceName);

    indi.updateTerminal();
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    const modalEl = document.getElementById('indi_console');

    modalEl.addEventListener('shown.bs.modal', setupAndUpdateTerminal);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    const modalEl = document.getElementById('indi_console');

    modalEl.removeEventListener('shown.bs.modal', setupAndUpdateTerminal);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <button class="btn btn-xs btn-secondary" type="button" @click="openModal">
        <i class="bi bi-card-text"></i>
        logs
        <span class="badge rounded-pill bg-danger">
            {{ indiStore.numberOfMessages(props.deviceName) }}
            <span class="visually-hidden">available messages</span>
        </span>
    </button>

    <!-- *********************************************************************************************************** -->

</template>
