<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, computed} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const variableFilter = ref('');

const blobFilter = ref('');

const streamFilter = ref('');

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
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

                    <!-- ******************************************************************************************* -->

                </tab-pane>

            </nav-tabs>

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
