<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

import Multiselect from '@vueform/multiselect';

import * as uuid from 'uuid';

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
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const devices = computed(() => {

    const result = Object.values(props.devices);

    result.sort((x, y) => x.rank - y.rank);

    return result;
});

/*--------------------------------------------------------------------------------------------------------------------*/

let rank = 0;

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceAppend = () => {

    const id = uuid.v4();

    props.devices[id] = {
        id: id,
        rank: rank,
        category: '',
        device: '',
    };

    rank++;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceRm = (device) => {

    delete props.devices[device.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceDw = (device1) => {

    const array = devices.value;

    const index = array.findIndex((device2) => device2.id === device1.id);

    if(index > 0x0000000000)
    {
        const device2 = array[index - 1];

        device1.rank--;
        device2.rank++;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const deviceUp = (device1) => {

    const array = devices.value;

    const index = array.findIndex(device2 => device2.id === device1.id);

    if(index < array.length)
    {
        const device2 = array[index + 1];

        device1.rank++;
        device2.rank--;
    }
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

                <tbody>
                    <tr v-for="device in devices" :key="device">
                        <td class="text-center">
                            <button class="btn btn-sm btn-link" type="button" @click="deviceDw(device)">
                                <i class="bi bi-caret-up-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-link" type="button" @click="deviceUp(device)">
                                <i class="bi bi-caret-down-fill"></i>
                            </button>
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
                </tbody>

                <!-- *********************************************************************************************** -->

            </table>

            <!-- *************************************************************************************************** -->

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
