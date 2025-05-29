<!--suppress CssUnusedSymbol -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, computed, reactive, onMounted, onUnmounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

import NyxHome from "./dashboard/NyxHome.vue";
import NyxDevice from './dashboard/NyxDevice.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'connect',
    'disconnect',
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const mqtt = inject('mqtt');
const nss = inject('nss');
const nyx = inject('nyx');

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const devices = computed(() => {

    const result = {
        'Home': {}
    };

    Object.values(nyxStore.defXXXVectorDict).forEach((defXXXVector) => {

        /*------------------------------------------------------------------------------------------------------------*/

        if(!('@group' in defXXXVector) || !defXXXVector['@group'])
        {
            defXXXVector['@group'] = 'Main Control';
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let device;

        if(defXXXVector['@device'] in result) {
            device = result[defXXXVector['@device']] ; //;
        }
        else {
            device = result[defXXXVector['@device']] = {};
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let group;

        if(defXXXVector['@group'] in device) {
            group = device[defXXXVector['@group']] ; //;
        }
        else {
            group = device[defXXXVector['@group']] = {};
        }

        /*------------------------------------------------------------------------------------------------------------*/

        group[defXXXVector['@name']] = defXXXVector;

        /*------------------------------------------------------------------------------------------------------------*/
    });

    return reactive(result);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    nyx.init(mqtt, nss);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    nyx.final();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                  -->
    <!-- *********************************************************************************************************** -->

    <div class="d-flex flex-column h-100">

        <nav-tabs margin="mb-4">

            <tab-pane class="align-items-center justify-content-center" :title="deviceName" icon="command" v-for="(deviceInfo, deviceName, deviceIndex) in devices" :key="deviceName">

                <div class="d-flex align-items-center justify-content-center h-100">

                    <nyx-home @connect="emit('connect')" @disconnect="emit('disconnect')" v-if="deviceIndex === 0" />

                    <nyx-device :device-name="deviceName"
                                :device-info="deviceInfo"
                                v-else
                    />

                </div>

            </tab-pane>

        </nav-tabs>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="nyx_console">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-card-text"></i>
                            {{ nyxStore.curDeviceName }}
                            [
                                <button class="btn btn-xs btn-secondary" type="button" @click="nyx.clearTerminal">
                                    <i class="bi bi-trash"></i>
                                    empty
                                    <span class="badge rounded-pill bg-danger">
                                        {{ nyxStore.numberOfMessages(nyxStore.curDeviceName) }}
                                    </span>
                                </button>
                            ]
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body bg-black px-3 py-2" id="nyx_terminal"></div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

.modal-body {
    border-bottom-right-radius: var(--bs-border-radius);
    border-bottom-left-radius: var(--bs-border-radius);
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
