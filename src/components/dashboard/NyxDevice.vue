<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

import NyxPanel from './NyxGroup.vue';
import NyxConsole from './NyxConsole.vue';

import NavTabs from '../ui/NavTabs.vue';
import TabPane from '../ui/TabPane.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    deviceName: {
        type: String,
        default: '',
    },
    deviceInfo: {
        type: Object,
        default: {},
    },
    deviceIndex: {
        type: Number,
        default: 0,
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="shadow card mb-3" style="width: 1200px;">
        <div class="card-header px-3 py-2">
            <i class="bi bi-command"></i>
            {{ deviceName }}
            [
                <nyx-console :device-name="deviceName" />
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <nav-tabs margin="mb-4" v-if="nyxStore.isConnected">

                <tab-pane :title="groupName" v-for="(groupInfo, groupName) in deviceInfo" :key="groupName">

                    <nyx-panel :group-info="groupInfo" />

                </tab-pane>

            </nav-tabs>

            <!-- *************************************************************************************************** -->

            <div v-else>
                No longer connected...
            </div>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
