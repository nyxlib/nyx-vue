<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, computed, reactive, onMounted, onUnmounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

import NyxHome from './dashboard/NyxHome.vue';
import NyxDevice from './dashboard/NyxDevice.vue';

import NavTabs from './ui/NavTabs.vue';
import TabPane from './ui/TabPane.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    showDevices: {
        type: Boolean,
        default: true,
    },
});

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

    const result = {};

    Object.values(nyxStore.defXXXVectorDict).forEach((defXXXVector) => {

        /*------------------------------------------------------------------------------------------------------------*/

        if(!('@group' in defXXXVector) || !defXXXVector['@group'])
        {
            defXXXVector['@group'] = 'Main';
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let device;

        if(defXXXVector['@device'] in result) {
            device = result[defXXXVector['@device']] /**/;
        }
        else {
            device = result[defXXXVector['@device']] = {};
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let group;

        if(defXXXVector['@group'] in device) {
            group = device[defXXXVector['@group']] /**/;
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
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="d-flex flex-column h-100">

        <nav-tabs margin="mb-2">

            <!-- *************************************************************************************************** -->
            <!-- HOME PANEL                                                                                          -->
            <!-- *************************************************************************************************** -->

            <tab-pane class="align-items-center justify-content-center" title="Home" icon="house">

                <div class="d-flex align-items-center justify-content-center h-100">

                    <nyx-home @connect="emit('connect')" @disconnect="emit('disconnect')" />

                </div>

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- NYX PANEL                                                                                           -->
            <!-- *************************************************************************************************** -->

            <tab-pane title="Nyx" icon="command" v-if="showDevices">

                <!-- *********************************************************************************************** -->

                <div class="d-flex flex-column h-100" v-if="Object.keys(devices).length > 0">

                    <nav-tabs margin="mb-2">

                        <tab-pane :title="deviceName" icon="command" v-for="(deviceDescr, deviceName) in devices" :key="deviceName">

                            <div class="d-flex align-items-center justify-content-center h-100">

                                <nyx-device :device-name="deviceName"
                                            :device-descr="deviceDescr"
                                />

                            </div>

                        </tab-pane>

                    </nav-tabs>

                </div>

                <!-- *********************************************************************************************** -->

                <div class="d-flex align-items-center justify-content-center h-100" v-else>

                    <div class="text-center">
                        <span class="spinner-grow" style="width: 3rem; height: 3rem;"></span>
                        <br />
                        Waiting for connection...
                    </div>

                </div>

                <!-- *********************************************************************************************** -->

            </tab-pane>

            <!-- *************************************************************************************************** -->
            <!-- MISC PANELS                                                                                         -->
            <!-- *************************************************************************************************** -->

            <slot></slot>

            <!-- *************************************************************************************************** -->
            <!-- BUTTONS                                                                                             -->
            <!-- *************************************************************************************************** -->

            <template #button>
                <slot name="button"></slot>
            </template>

            <!-- *************************************************************************************************** -->

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
    border-bottom-right-radius: var(--bs-modal-border-radius);
    border-bottom-left-radius: var(--bs-modal-border-radius);
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
