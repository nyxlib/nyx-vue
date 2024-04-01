<!--suppress CssUnusedSymbol -->

<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, computed, onMounted } from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

import IndiHome from "./dashboard/IndiHome.vue";
import IndiDevice from './dashboard/IndiDevice.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const terminalDiv = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

const devices = computed(() => {

    const result = {
        'Home': {}
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
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => indiStore.setup(terminalDiv.value));

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 d-flex flex-column">

        <!-- ******************************************************************************************************* -->

        <ul class="nav nav-tabs mb-4" role="tablist">

            <!-- *************************************************************************************************** -->

            <li class="nav-item" role="presentation" v-for="(deviceName, deviceIndex) in Object.keys(devices)" :key="deviceIndex">

                <button :class="`nav-link ${deviceIndex === 0 ? 'active' : ''} px-3 py-2`" type="button" data-bs-toggle="tab" :data-bs-target="`#indi_device_pane_${deviceIndex}`" role="tab">
                    <i class="bi bi-command"></i>
                    {{ deviceName }}
                </button>

            </li>

            <!-- *************************************************************************************************** -->

        </ul>

        <!-- ******************************************************************************************************* -->

        <div class="tab-content flex-grow-1">

            <!-- *************************************************************************************************** -->

            <div :class="`tab-pane align-items-center justify-content-center ${deviceIndex === 0 ? 'show active' : ''}`" :id="`indi_device_pane_${deviceIndex}`" tabindex="0" role="tabpanel" v-for="(deviceInfo, deviceName, deviceIndex) in devices" :key="deviceName">

                <indi-home v-if="deviceName === 'Home'" /><indi-device :device-name="deviceName" :device-info="deviceInfo" :device-index="deviceIndex" v-else />

            </div>

            <!-- *************************************************************************************************** -->

        </div>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- CONSOLE                                                                                                     -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="indi_console">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-card-text"></i>
                            {{ indiStore.currentDeviceName }}
                            [
                                <button class="btn btn-xs btn-secondary" type="button" @click="indiStore.clearTerminal()">
                                    <i class="bi bi-trash"></i>
                                    empty
                                </button>
                            ]
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body bg-black px-3 py-2" ref="terminalDiv"></div>

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
