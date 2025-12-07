<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

import NavTabs from '../ui/NavTabs.vue';
import TabPane from '../ui/TabPane.vue';

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
        <div :class="['card-body', 'px-3', 'py-2', {'disabled': !nyxStore.isConnected}]">

            <!-- *************************************************************************************************** -->

            <nav-tabs margin="mb-4">

                <template v-for="(groupDescr, groupName) in deviceDescr" :key="groupName">

                    <tab-pane :title="groupName" v-if="Object.values(groupDescr).some((x) => !['defBLOBVector', 'defStreamVector'].includes(x['<>']))">

                        <nyx-panel :group-descr="groupDescr" />

                    </tab-pane>

                </template>

            </nav-tabs>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

.disabled {
    position: relative;
    cursor: not-allowed;
    pointer-events: none;
    user-select: none;
    opacity: 0.8;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.disabled::after {
    inset: 0;
    content: "";
    position: absolute;
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%278%27%20height%3D%278%27%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3Cpattern%20id%3D%27diagonalHatch%27%20patternUnits%3D%27userSpaceOnUse%27%20width%3D%278%27%20height%3D%278%27%3E%0A%20%20%20%20%20%20%3Cpath%20d%3D%27M-2%2C2%20l4%2C-4%20M0%2C8%20l8%2C-8%20M6%2C10%20l4%2C-4%27%20stroke%3D%27%23000000%27%20stroke-opacity%3D%270.1%27%20stroke-width%3D%272%27%2F%3E%0A%20%20%20%20%3C%2Fpattern%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27url%28%23diagonalHatch%29%27%2F%3E%0A%3C%2Fsvg%3E");
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
