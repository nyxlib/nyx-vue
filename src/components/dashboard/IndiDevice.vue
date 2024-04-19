<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import IndiPanel from './IndiGroup.vue';
import IndiConsole from './IndiConsole.vue';

import NavTabs from '../controls/NavTabs.vue';
import TabPane from '../controls/TabPane.vue';

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
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card mb-3" style="width: 1200px;">
        <div class="card-header px-3 py-2">
            <i class="bi bi-command"></i>
            {{ deviceName }}
            [
                <indi-console :device-name="deviceName" />
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <nav-tabs margin="mb-4">

                <tab-pane :title="groupName" v-for="(groupInfo, groupName, groupIndex) in deviceInfo" :key="groupName">

                    <indi-panel :group-info="groupInfo" />

                </tab-pane>

            </nav-tabs>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
