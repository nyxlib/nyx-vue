<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import IndiPanel from './IndiGroup.vue';
import IndiConsole from './IndiConsole.vue';

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

            <ul class="nav nav-tabs mb-4" role="tablist">

                <li class="nav-item" role="presentation" v-for="(groupName, groupIndex) in Object.keys(deviceInfo)" :key="groupIndex">

                    <button :class="`nav-link ${groupIndex === 0 ? 'active' : ''} px-3 py-2`" type="button" data-bs-toggle="tab" :data-bs-target="`#indi_group_pane_${deviceIndex}_${groupIndex}`" role="tab">
                        {{ groupName }}
                    </button>

                </li>

            </ul>

            <!-- *************************************************************************************************** -->

            <div class="tab-content">

                <div :class="`tab-pane ${groupIndex === 0 ? 'show active' : ''}`" :id="`indi_group_pane_${deviceIndex}_${groupIndex}`" tabindex="0" role="tabpanel" v-for="(groupInfo, groupName, groupIndex) in deviceInfo" :key="groupName">

                    <indi-panel :group-info="groupInfo" />

                </div>

            </div>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
