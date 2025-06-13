<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, computed, watchEffect} from 'vue';

import draggable from 'vuedraggable';

import Multiselect from '@vueform/multiselect';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

import NavTabs from './ui/NavTabs.vue';

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

const variableFilter = ref('');

const blobFilter = ref('');

const streamFilter = ref('');

/*--------------------------------------------------------------------------------------------------------------------*/

const filteredVariables = computed(() => {

    return Object.fromEntries(Object.entries(nyxStore.variables)
        .sort(([name1], [name2]) => name1.localeCompare(name2))
        .filter(([name]) => !variableFilter.value || name.toLowerCase().includes(variableFilter.value.toLowerCase())
    ));
});

/*--------------------------------------------------------------------------------------------------------------------*/

const filteredBLOBs = computed(() => {

    return Object.fromEntries(Object.entries(nyxStore.blobs)
        .sort(([name1], [name2]) => name1.localeCompare(name2))
        .filter(([name]) => !blobFilter.value || name.toLowerCase().includes(blobFilter.value.toLowerCase())
    ));
});

/*--------------------------------------------------------------------------------------------------------------------*/

const filteredStreams = computed(() => {

    return Object.fromEntries(Object.entries(nyxStore.streams)
        .sort(([name1], [name2]) => name1.localeCompare(name2))
        .filter(([name]) => !streamFilter.value || name.toLowerCase().includes(streamFilter.value.toLowerCase())
    ));
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
            <i class="bi bi-braces"></i>
            Variables
        </div>
        <div class="card-body px-3 py-2">

            <nav-tabs>

                <tab-pane title="Variables">

                    <!-- ******************************************************************************************* -->
                    <!-- VARIABLES                                                                                   -->
                    <!-- ******************************************************************************************* -->

                    <div class="input-group mb-2">
                        <span class="input-group-text">
                            <i class="bi bi-funnel"></i>
                            Filter
                        </span>
                        <input class="form-control" type="text" v-model="variableFilter" />
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th style="width: 66.66%;">Variable</th>
                                    <th style="width: 33.33%;">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(value, name) in filteredVariables" :key="name">
                                    <td class="user-select-all"><i>{{name}}</i></td>
                                    <td class="user-select-all">{{value['$']}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ******************************************************************************************* -->

                </tab-pane>

                <tab-pane title="BLOBs">

                    <!-- ******************************************************************************************* -->
                    <!-- BLOBS                                                                                       -->
                    <!-- ******************************************************************************************* -->

                    <div class="input-group mb-2">
                        <span class="input-group-text">
                            <i class="bi bi-funnel"></i>
                            Filter
                        </span>
                        <input class="form-control" type="text" v-model="streamFilter" />
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th style="width: 66.66%;">BLOB</th>
                                    <th style="width: 33.33%;">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(value, name) in filteredBLOBs" :key="name">
                                    <td class="user-select-all"><i>{{name}}</i></td>
                                    <td class="user-select-all">...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ******************************************************************************************* -->

                </tab-pane>

                <tab-pane title="Streams">

                    <!-- ******************************************************************************************* -->
                    <!-- STREAMS                                                                                     -->
                    <!-- ******************************************************************************************* -->

                    <div class="input-group mb-2">
                        <span class="input-group-text">
                            <i class="bi bi-funnel"></i>
                            Filter
                        </span>
                        <input class="form-control" type="text" v-model="streamFilter" />
                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th style="width: 33.33%;">Stream</th>
                                    <th style="width: 66.66%;">URL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(value, name) in filteredStreams" :key="name">
                                    <td class="user-select-all"><i>{{name}}</i></td>
                                    <td class="user-select-all">{{value['$']}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ******************************************************************************************* -->

                </tab-pane>

                <tab-pane title="INDI" icon="command" tab-class="ms-auto">

                    <!-- ******************************************************************************************* -->

                    <div class="card">
                        <div class="card-header px-3 py-2">
                            Device
                            [
                            <button class="btn btn-xs btn-primary" type="button" @click="deviceAppend">
                                <i class="bi bi-plus-lg"></i>
                                Add
                            </button>
                            ]
                        </div>
                        <div class="card-body px-3 py-2">

                            <!-- *********************************************************************************** -->

                            <div class="table-responsive">
                                <table class="table table-sm table-striped">

                                    <!-- *************************************************************************** -->

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

                                    <!-- *************************************************************************** -->

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
                                                        :disabled="!nyxStore.isConnected"
                                                        :options="nyxStore.categoryDefs" v-model="device.category" />
                                                </td>
                                                <td class="text-center">
                                                    <multiselect
                                                        mode="single"
                                                        :can-clear="false"
                                                        :searchable="true"
                                                        :create-option="false"
                                                        :close-on-select="true"
                                                        :disabled="!nyxStore.isConnected"
                                                        :options="nyxStore.deviceDefs" v-model="device.device" />
                                                </td>
                                            </tr>
                                        </template>
                                    </draggable>

                                    <!-- *************************************************************************** -->

                                </table>
                            </div>

                            <!-- *********************************************************************************** -->

                        </div>
                    </div>

                </tab-pane>

            </nav-tabs>

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
