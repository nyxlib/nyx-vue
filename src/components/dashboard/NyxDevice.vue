<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

import NyxPanel from './NyxGroup.vue';
import NyxConsole from './NyxConsole.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    deviceName: {
        type: String,
        default: '',
    },
    deviceDescr: {
        type: Object,
        default: () => {},
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

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

                <template v-for="(groupDescr, groupName) in deviceDescr" :key="groupName">

                    <tab-pane :title="groupName" v-if="Object.values(groupDescr).some((x) => !['defBLOBVector', 'defStreamVector'].includes(x['<>']))">

                        <nyx-panel :group-descr="groupDescr" />

                    </tab-pane>

                </template>

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
