<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { inject } from 'vue';

import { Modal } from 'bootstrap';

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
    const terminalEl = document.getElementById('indi_terminal');

    modalEl.addEventListener('shown.bs.modal', () => {

        indi.setupTerminal(terminalEl, props.deviceName);

        indi.updateTerminal();
    });

    new Modal(modalEl).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <button class="btn btn-xs btn-secondary" type="button" @click="openModal()">
        <i class="bi bi-card-text"></i>
        logs
        <span class="badge rounded-pill bg-danger">
            {{ indiStore.numberOfMessages(props.deviceName) }}
            <span class="visually-hidden">available messages</span>
        </span>
    </button>

    <!-- *********************************************************************************************************** -->

</template>
