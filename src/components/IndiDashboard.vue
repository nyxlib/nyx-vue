<!--suppress CssUnusedSymbol -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject, computed, onMounted, onUnmounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

import IndiHome from "./dashboard/IndiHome.vue";
import IndiDevice from './dashboard/IndiDevice.vue';

import NavTabs from "./controls/NavTabs.vue";
import TabPane from "./controls/TabPane.vue";

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'connect',
    'disconnect',
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');
const mqtt = inject('mqtt');

/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/

let timer = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const devices = computed(() => {

    const result = {
        'home': 'Home'
    };

    Object.values(indiStore.defXXXVectorDict).forEach((defXXXVector) => {

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

    return result;
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const getProperties = (connected) => {

        if(connected)
        {
            mqtt.subscribe('indi/json');
            mqtt.subscribe('indi/ping/node');
            mqtt.subscribe('indi/ping/client');

            mqtt.emit('indi/cmd/json', '{"<>": "getProperties", "@version": "1.7"}');
        }
    };

    mqtt.setConnectionCallback(getProperties);

    getProperties(mqtt.connected());

    /*----------------------------------------------------------------------------------------------------------------*/

    mqtt.setMessageCallback((topic, payload) => {

        try
        {
            /**/ if(topic === 'indi/json')
            {
                 indi.processMessage(JSON.parse(payload));
            }
            else if(topic === 'indi/ping/node')
            {
                indi.processPing(payload, true);
            }
            else if(topic === 'indi/ping/client')
            {
                indi.processPing(payload, false);
            }
        }
        catch(e)
        {
            console.error(`Error parsing message: ${e}`);
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    clearInterval(timer);

    /*----------------------------------------------------------------------------------------------------------------*/

    mqtt.setConnectionCallback(null);

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- MONITORING                                                                                                  -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 d-flex flex-column">

        <nav-tabs margin="mb-4">

            <tab-pane class="align-items-center justify-content-center" :title="deviceName" icon="command" v-for="(deviceInfo, deviceName, deviceIndex) in devices" :key="deviceName">

                <indi-home @connect="emit('connect')" @disconnect="emit('disconnect')" v-if="deviceIndex === 0" />

                <indi-device :device-name="deviceName" :device-info="deviceInfo" :device-index="deviceIndex" v-else />

            </tab-pane>

        </nav-tabs>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="indi_console">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-card-text"></i>
                            {{ indiStore.curDeviceName }}
                            [
                                <button class="btn btn-xs btn-secondary" type="button" @click="indi.clearTerminal">
                                    <i class="bi bi-trash"></i>
                                    empty
                                    <span class="badge rounded-pill bg-danger">
                                        {{ indiStore.numberOfMessages(indiStore.curDeviceName) }}
                                    </span>
                                </button>
                            ]
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body bg-black px-3 py-2" id="indi_terminal"></div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

.tab-content,
.tab-pane.show {
    display: flex;
    width: 100%;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.modal-body {
    border-bottom-right-radius: var(--bs-border-radius);
    border-bottom-left-radius: var(--bs-border-radius);
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
