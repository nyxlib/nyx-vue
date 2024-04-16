<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, computed, onMounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');

/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    groups: {
        type: Array,
        default: ['Global'],
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const plotType = ref('');
const plotName = ref('');
const plotGroup = ref('');
const metric1 = ref([]);
const metric2 = ref([]);

/*--------------------------------------------------------------------------------------------------------------------*/

const PLOT_TYPES = [
    {value: 'line', label: 'Line'},
    {value: 'bar', label: 'Bar'},
    {value: 'doughnut', label: 'Doughnut'},
    {value: 'polar', label: 'Polar'},
    {value: 'radar', label: 'Radar'},
    {value: 'scatter', label: 'Scatter'},
];

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => !!plotName.value && !!plotGroup.value && metric1.value.length > 0 && (plotType.value !== 'scatter' || metric1.value.length === metric2.value.length));

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidget = () => {

    plotType.value = 'line';
    plotName.value = '';
    plotGroup.value = '';
    metric1.value = [];
    metric2.value = [];

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addWidget = () => {

    //grid.addWidget({w: 2, content: 'item'});

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).hide();
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    new Tooltip(document.body, {
        selector: '[data-bs-title]'
    });

    GridStack.init({
        removable: '#AAE7F472'
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 w-100 p-3">

        <!-- ******************************************************************************************************* -->

        <ul class="nav nav-tabs mb-4" role="tablist">

            <!-- *************************************************************************************************** -->

            <li class="nav-item" role="presentation" v-for="(groupName, groupIndex) in groups" :key="groupIndex">

                <button :class="`nav-link ${groupIndex === 0 ? 'active' : ''} px-3 py-2`" type="button" data-bs-toggle="tab" :data-bs-target="`#indi_monitoring_pane_${groupIndex}`" role="tab">
                    {{ groupName }}
                </button>

            </li>

            <!-- *************************************************************************************************** -->

        </ul>

        <!-- *********************************************************************************************************** -->

        <div class="tab-content">

            <div :class="`tab-pane fade ${groupIndex === 0 ? 'show active' : ''}`" :id="`indi_monitoring_pane_${groupIndex}`" role="tabpanel" tabindex="0" v-for="(groupName, groupIndex) in groups" :key="groupIndex">

                <div class="grid-stack h-100 w-100" :data-title="groupName"></div>

            </div>

        </div>

        <!-- *********************************************************************************************************** -->

    </div>

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-primary ms-0" type="button" data-bs-placement="top" data-bs-title="Add a new widget" @click="newWidget">
            <i class="bi bi-plus-lg"></i>
        </button>

        <button class="btn btn-danger ms-1" type="button" data-bs-placement="top" data-bs-title="Drop here to remove" id="AAE7F472">
            <i class="bi bi-trash2"></i>
        </button>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="indi_metrics">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-plus-lg"></i>
                            Add a metric
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body px-3 py-2">

                        <!-- *************************************************************************************** -->

                        <div class="mb-3">
                            <label for="F8E884DD" class="form-label">Plot type</label>
                            <multiselect
                                mode="single"
                                id="F8E884DD"
                                :can-clear="false"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="PLOT_TYPES" v-model="plotType" />
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="F938E61B" class="form-label">Plot name</label>
                                    <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Name" v-model="plotName" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="C8C721F4" class="form-label">Plot group</label>
                                    <multiselect
                                        mode="single"
                                        id="C8C721F4"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="groups.map((x) => ({value: x, label: x}))" v-model="plotGroup" />
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="mb-3" v-if="plotType !== ''">
                            <label for="BBA0018F" class="form-label">Metric 1</label>
                            <multiselect
                                mode="tags"
                                id="BBA0018F"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="Object.keys(indiStore.variables || {}).map((x) => ({value: x, label: x}))" v-model="metric1" />
                        </div>

                        <div class="mb-3" v-if="plotType === 'scatter'">
                            <label for="B5D75D1E" class="form-label">Metric 2</label>
                            <multiselect
                                mode="tags"
                                id="B5D75D1E"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="Object.keys(indiStore.variables || {}).map((x) => ({value: x, label: x}))" v-model="metric2" />
                        </div>

                        <!-- *************************************************************************************** -->

                    </div>

                    <div class="modal-footer px-3 py-1">

                        <!-- *************************************************************************************** -->

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            Cancel
                        </button>

                        <button class="btn btn-primary" type="button" @click="addWidget" :disabled="!isValid">
                            <i class="bi bi-plus-ls">Add</i>
                        </button>

                        <!-- *************************************************************************************** -->

                    </div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
