<!--suppress HtmlUnknownAttribute -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, inject, render, computed, onMounted, onUnmounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

import {v4} from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

import XXXChart from './controls-chartjs/XXXChart.vue';
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
const plotTitle = ref('');
const plotGroup = ref('');
const showLegend = ref(false);
const metric1 = ref([]);
const metric2 = ref([]);

/*--------------------------------------------------------------------------------------------------------------------*/

const labelsets = ref({});

const datasets = ref({});

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

const PLOT_MODES = [
    {value: 'temporal', label: 'Temporal'},
    {value: 'blob', label: 'BLOB'},
];

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => !!plotTitle.value && !!plotGroup.value && metric1.value.length > 0 && (plotType.value !== 'scatter' || metric1.value.length === metric2.value.length));

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep1 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    plotType.value = 'line';
    plotMode.value = 'temporal';
    plotTitle.value = '';
    plotGroup.value = '';
    showLegend.value = false;
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
        plotTitle: plotTitle.value,
        plotGroup: plotGroup.value,
        showLegend: showLegend.value,
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

        /*------------------------------------------------------------------------------------------------------------*/

        const labelset = [/*----------------------*/];

        const dataset = metric.metric1.map(() => []);

        /*------------------------------------------------------------------------------------------------------------*/

        labelsets.value[metric.id] = labelset;

        datasets.value[metric.id] = dataset;

        props.metrics[metric.id] = metric;

        /*------------------------------------------------------------------------------------------------------------*/

        let chart;

        switch(metric.plotType)
        {
            case 'line':
            case 'bar':
            case 'doughnut':
            case 'polar':
            case 'radar':
                chart = h(XXXChart, {
                    type: metric.plotType,
                    title: metric.plotTitle,
                    showLegend: metric.showLegend,
                    metricNames: metric.metric1,
                    //////Names: metric.metric2,
                    labelset: labelset,
                    dataset: dataset,
                });
                break;

            case 'scatter':
                chart = h(ScatterChart, {
                    title: metric.plotTitle,
                    showLegend: metric.showLegend,
                    metrics1Names: metric.metric1,
                    metrics2Names: metric.metric2,
                    labelset: labelset,
                    dataset: dataset,
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

    delete datasets.value[widget.metric.id];

    delete props.metrics[widget.metric.id];
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

    GridStack.initAll({removable: '#AAE7F472'}).forEach((grid) => {

        grid.on('resizestop', updateWidget);

        grid.on('dragstop', updateWidget);

        grid.on('removed', (e, items) => {

            items.forEach((item) => {

                removeWidget(e, item.el);
            });
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

        <!-- ******************************************************************************************************* -->

        <div class="tab-content" style="height: calc(100% - 3.5rem); width: calc(100% - 0rem);">

            <div :class="`grid-stack tab-pane fade ${groupIndex === 0 ? 'show active' : 'xxxx xxxxxx'} h-100 w-100`" :data-title="groupName" :id="`indi_monitoring_pane_${groupIndex}`" tabindex="0" role="tabpanel" v-for="(groupName, groupIndex) in groups" :key="groupIndex"></div>

        </div>

        <!-- ******************************************************************************************************* -->

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
                                    <label for="D38EC0FA" class="form-label">Plot mode</label>
                                    <multiselect
                                        mode="single"
                                        id="D38EC0FA"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="PLOT_MODES" v-model="plotMode" />
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="F938E61B" class="form-label">Plot name</label>
                                    <div class="input-group input-group-sm">
                                        <input class="form-control" type="text" id="F938E61B" placeholder="Name" v-model="plotTitle" />
                                        <div class="input-group-text">
                                            <input class="form-check-input mt-0 me-1" type="checkbox" id="C5306DB0" v-model="showLegend" :true-value="true" :false-value="false" />
                                            <label class="form-check-label" for="C5306DB0">Legend</label>
                                        </div>
                                    </div>
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
