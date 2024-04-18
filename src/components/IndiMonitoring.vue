<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, inject, render, computed, onMounted, onUnmounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

import {v4} from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

import BarChart from './controls-chartjs/BarChart.vue';
import DoughnutChart from './controls-chartjs/DoughnutChart.vue';
import LineChart from './controls-chartjs/LineChart.vue';
import PolarChart from './controls-chartjs/PolarChart.vue';
import RadarChart from './controls-chartjs/RadarChart.vue';
import ScatterChart from './controls-chartjs/ScatterChart.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');

/*--------------------------------------------------------------------------------------------------------------------*/

const indiStore = useIndiStore(window.pinia);

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    groups: {
        type: Array,
        default: ['Global'],
    },
    metrics: {
        type: Object,
        default: {/*EMPTY*/},
    },
    refreshInterval: {
        type: Number,
        default: 100,
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const plotType = ref('');
const plotMode = ref('');
const plotName = ref('');
const plotGroup = ref('');
const metric1 = ref([]);
const metric2 = ref([]);

/*--------------------------------------------------------------------------------------------------------------------*/

let timer = null;

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

const newWidgetStep1 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    plotType.value = 'line';
    plotMode.value = 'temporal';
    plotName.value = '';
    plotGroup.value = '';
    metric1.value = [];
    metric2.value = [];

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    let h, w;

    if(['line', 'bar', 'scatter'].includes(plotType.value)) {
        h = 2; w = 4;
    }
    else {
        h = 2; w = 2;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    createWidget({
        id: v4(),
        plotType: plotType.value,
        plotMode: plotMode.value,
        plotName: plotName.value,
        plotGroup: plotGroup.value,
        metric1: metric1.value,
        metric2: metric2.value,
        x: 0, y: 0,
        h: h, w: w,
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (metric) => {

    const el = document.querySelector(`[data-title="${metric.plotGroup}"]`);

    if(el)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const widget = el.gridstack.addWidget({
            x: metric.x,
            y: metric.y,
            h: metric.h,
            w: metric.w,
        });

        widget.metric = metric;

        props.metrics[metric.id] = metric;

        widget.firstElementChild.id = metric.id;

        /*------------------------------------------------------------------------------------------------------------*/

        let chart;

        switch(metric.plotType)
        {
            case 'line':
                chart = h(LineChart, {
                    metricsNames: metric.metric1
                });
                break;

            case 'bar':
                chart = h(BarChart, {
                    metricsNames: metric.metric1
                });
                break;

            case 'doughnut':
                chart = h(DoughnutChart, {
                    metricsNames: metric.metric1
                });
                break;

            case 'polar':
                chart = h(PolarChart, {
                    metricsNames: metric.metric1
                });
                break;

            case 'radar':
                chart = h(RadarChart, {
                    metricsNames: metric.metric1
                });
                break;

            case 'scatter':
                chart = h(ScatterChart, {
                    metrics1Names: metric.metric1,
                    metrics2Names: metric.metric2,
                });
                break;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        render(chart, widget.firstElementChild);

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateWidget = (e, widget) => {

    widget.metric.x = widget.gridstackNode.x;
    widget.metric.y = widget.gridstackNode.y;
    widget.metric.h = widget.gridstackNode.h;
    widget.metric.w = widget.gridstackNode.w;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const removeWidget = (e, widget) => {

    delete props.metrics[widget.el.metric.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/

const refreshContent = () => {

    console.log('*');
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    new Tooltip(document.body, {
        selector: '[data-bs-title]'
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    const grid = GridStack.init({
        removable: '#AAE7F472'
    });

    grid.on('resizestop', updateWidget);

    grid.on('dragstop', updateWidget);

    grid.on('removed', (e, items) => {

        items.forEach((item) => {

            removeWidget(e, item)
        });
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    Object.values(props.metrics).forEach(createWidget);

    /*----------------------------------------------------------------------------------------------------------------*/

    timer = setInterval(refreshContent, props.refreshInterval);

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    if(timer)
    {
        clearInterval(timer);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 w-100 p-3">

        <!-- ******************************************************************************************************* -->

        <ul class="nav nav-tabs mb-1" role="tablist">

            <!-- *************************************************************************************************** -->

            <li class="nav-item" role="presentation" v-for="(groupName, groupIndex) in groups" :key="groupIndex">

                <button :class="`nav-link ${groupIndex === 0 ? 'active' : 'xxxxxx'} px-3 py-2`" type="button" data-bs-toggle="tab" :data-bs-target="`#indi_monitoring_pane_${groupIndex}`" role="tab">
                    {{ groupName }}
                </button>

            </li>

            <!-- *************************************************************************************************** -->

        </ul>

        <!-- *********************************************************************************************************** -->

        <div class="tab-content0" style="height: calc(100% - 3.5rem); width: calc(100% - 0rem);">

            <div :class="`grid-stack tab-pane fade ${groupIndex === 0 ? 'show active' : 'xxxx xxxxxx'} h-100 w-100`" :data-title="groupName" :id="`indi_monitoring_pane_${groupIndex}`" tabindex="0" role="tabpanel" v-for="(groupName, groupIndex) in groups" :key="groupIndex"></div>

        </div>

        <!-- *********************************************************************************************************** -->

    </div>

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-primary ms-0" type="button" data-bs-placement="top" data-bs-title="Add a new widget" @click="newWidgetStep1">
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

                        <div class="row">
                            <div class="col-md-6">
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
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Mode</label>
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-text">
                                            <input class="form-check-input mt-0" type="radio" name="indi_metric_mode">
                                        </div>
                                        <div class="input-group-text" style="width: calc(50% - 2rem + 1px);">
                                            Temporal
                                        </div>
                                        <div class="input-group-text">
                                            <input class="form-check-input mt-0" type="radio" name="indi_metric_mode">
                                        </div>
                                        <div class="input-group-text" style="width: calc(50% - 2rem + 1px);">
                                            BLOB
                                        </div>
                                    </div>
                                </div>
                            </div>
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

                        <div class="mb-3" v-if="plotType !== /**/''/**/">
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

                        <button class="btn btn-primary" type="button" @click="newWidgetStep2" :disabled="!isValid">
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
