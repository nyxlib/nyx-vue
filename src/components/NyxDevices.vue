<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watchEffect} from 'vue';

import draggable from 'vuedraggable';

import Multiselect from '@vueform/multiselect';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    devices: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const sortedDevices = ref([]);

watchEffect(() => {

    sortedDevices.value = Object.values(props.devices).sort((a, b) => a.rank - b.rank);
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const onDragEnd = () => {

    for(let i = 0; i < sortedDevices.value.length; i++)
    {
        const device = sortedDevices.value[i];

        props.devices[device.id].rank = i;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceAppend = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const id = __NYX_UUID__.v4();

    const rank = Date.now();

    props.devices[id] = {
        id: id,
        rank: rank,
        category: '',
        device: '',
    };

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceRm = (device) => {

    delete props.devices[device.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card">
        <div class="card-header px-3 py-2">
            <i class="bi bi-node-plus"></i>
            Device
            [
                <button class="btn btn-xs btn-primary" type="button" @click="deviceAppend">
                    <i class="bi bi-plus-lg"></i>
                    Add device
                </button>
            ]
        </div>
        <div class="card-body px-3 py-2">

            <!-- *************************************************************************************************** -->

            <table class="table table-sm table-striped">

                <!-- *********************************************************************************************** -->

                <thead>
                    <tr>
                        <th class="text-center" style="width: 105px;">
                            Tools
                        </th>
                        <th class="text-center" style="width: auto;">
                            Category
                        </th>
                        <th class="text-center" style="width: auto;">
                            Device
                        </th>
                    </tr>
                </thead>

                <!-- *********************************************************************************************** -->

                <draggable tag="tbody" handle=".drag-handle" v-model="sortedDevices" item-key="id" @end="onDragEnd">
                    <template #item="{element: device}">
                        <tr :key="device.id">
                            <td class="text-center">
                                <i class="bi bi-list drag-handle" style="cursor: grab;"></i>
                                <button class="btn btn-sm btn-link" type="button" @click="deviceRm(device)">
                                    <i class="bi bi-trash2 text-danger"></i>
                                </button>
                            </td>
                            <td class="text-center">
                                <multiselect
                                    mode="single"
                                    :can-clear="false"
                                    :searchable="true"
                                    :create-option="false"
                                    :close-on-select="true"
                                    :options="nyxStore.categoryDefs" v-model="device.category" />
                            </td>
                            <td class="text-center">
                                <multiselect
                                    mode="single"
                                    :can-clear="false"
                                    :searchable="true"
                                    :create-option="false"
                                    :close-on-select="true"
                                    :options="nyxStore.deviceDefs" v-model="device.device" />
                            </td>
                        </tr>
                    </template>
                </draggable>

                <!-- *********************************************************************************************** -->

            </table>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
