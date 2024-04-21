<!--suppress HtmlUnknownAttribute -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, inject, render, computed, reactive, onMounted, onUnmounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

import Chart from 'chart.js/auto';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

import NavTabs from './controls/NavTabs.vue';
import TabPane from './controls/TabPane.vue';
import XXXChart from './controls/XXXChart.vue';

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
        required: true,
    },
    metrics: {
        type: Object,
        required: true,
    },
    refreshInterval: {
        type: Number,
        default: 100,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const PLOT_MODES = [
    {value: 'temporal', label: 'Temporal'},
    {value: 'blob', label: 'BLOB'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const PLOT_TYPES = [
    {value: 'line', label: 'Line'},
    {value: 'bar', label: 'Bar'},
    {value: 'scatter', label: 'Scatter'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    id: null,
    plotMode: 'temporal',
    divider: 1,
    plotType: 'line',
    plotTitle: '',
    plotGroup: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
    xLogScale: false,
    yLogScale: false,
    metric1: [],
    metric2: [],
});

/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => !!state.plotGroup && state.metric1.length > 0 && (state.plotType !== 'scatter' || state.metric1.length === state.metric2.length));

/*--------------------------------------------------------------------------------------------------------------------*/

const labelsetDict = {};
const datasetDict = {};
const counterDict = {};
const widgetDict = {};

/*--------------------------------------------------------------------------------------------------------------------*/

let timer = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep1 = (id) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(id)
    {
        const metric = props.metrics[id];

        state.id = id;
        state.plotMode = metric.plotMode;
        state.divider = metric.divider;
        state.plotType = metric.plotType;
        state.plotTitle = metric.plotTitle;
        state.plotGroup = metric.plotGroup;
        state.xTitle = metric.xTitle;
        state.yTitle = metric.yTitle;
        state.showLegend = metric.showLegend;
        state.xLogScale = metric.xLogScale;
        state.yLogScale = metric.yLogScale;
        state.metric1 = metric.metric1;
        state.metric2 = metric.metric2;
    }
    else
    {
        state.id = null;
        state.plotMode = 'temporal';
        state.divider = 1;
        state.plotType = 'line';
        state.plotTitle = '';
        state.plotGroup = '';
        state.xTitle = '';
        state.yTitle = '';
        state.showLegend = false;
        state.xLogScale = false;
        state.yLogScale = false;
        state.metric1 = [];
        state.metric2 = [];
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).show();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep2 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    let h, w;

    if(['line', 'bar', 'scatter'].includes(state.plotType)) {
        h = 2; w = 4;
    }
    else {
        h = 2; w = 2;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    createWidget({
        id: state.id || uuid.v4(),
        plotMode: state.plotMode,
        divider: state.divider,
        plotType: state.plotType,
        plotTitle: state.plotTitle,
        plotGroup: state.plotGroup,
        xTitle: state.xTitle,
        yTitle: state.yTitle,
        showLegend: state.showLegend,
        xLogScale: state.xLogScale,
        yLogScale: state.yLogScale,
        metric1: state.metric1,
        metric2: state.metric2,
        x: 0, y: 0,
        h: h, w: w,
    }, !!state.id);

    /*----------------------------------------------------------------------------------------------------------------*/

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).hide();

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const createWidget = (metric, edit) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* EDIT                                                                                                           */
    /*----------------------------------------------------------------------------------------------------------------*/

    if(edit)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        widgetDict[metric.id].gridstack.removeWidget(widgetDict[metric.id], true, false);

        /*------------------------------------------------------------------------------------------------------------*/

        const old = props.metrics[metric.id];

        metric.x = old.x;
        metric.y = old.y;
        metric.h = old.h;
        metric.w = old.w;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* CREATE                                                                                                         */
    /*----------------------------------------------------------------------------------------------------------------*/

    const el = document.querySelector(`[data-title="${metric.plotGroup}"]`);

    if(el)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const widget = el.gridstack.addWidget({
            x: metric.x,
            y: metric.y,
            h: metric.h,
            w: metric.w,
            content: (
                '<i class="bi bi-pencil-fill position-absolute" style="cursor: pointer; right: 1.50rem; top: -0.25rem;"></i>'
                +
                '<i class="bi bi-eraser-fill position-absolute" style="cursor: pointer; right: 0.00rem; top: -0.25rem;"></i>'
            ),
        });

        /*------------------------------------------------------------------------------------------------------------*/

        widget.querySelector('.bi-pencil-fill').onclick = () => newWidgetStep1(metric.id);

        widget.querySelector('.bi-eraser-fill').onclick = () => clearWidget(metric.id);

        widget.gridstack = el.gridstack;

        widget.metric = metric;

        /*------------------------------------------------------------------------------------------------------------*/

        if(!edit || datasetDict[metric.id].length !== metric.metric1.length)
        {
            labelsetDict[metric.id] = metric.plotType === 'scatter' ? null : [];

            datasetDict[metric.id] = metric.metric1.map(() => []);

            counterDict[metric.id] = 0;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        widgetDict[metric.id] = widget;

        props.metrics[metric.id] = metric;

        /*------------------------------------------------------------------------------------------------------------*/

        const chart = h(XXXChart, {
            mode: metric.plotMode,
            type: metric.plotType,
            title: metric.plotTitle,
            xTitle: metric.xTitle,
            yTitle: metric.yTitle,
            showLegend: metric.showLegend,
            xLogScale: metric.xLogScale,
            yLogScale: metric.yLogScale,
            metric1Names: metric.metric1,
            metric2Names: metric.metric2,
            labelset: labelsetDict[metric.id],
            dataset: datasetDict[metric.id],
        });

        /*------------------------------------------------------------------------------------------------------------*/

        render(chart, widget.firstElementChild);

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const clearWidget = (id) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const labelset = labelsetDict[id];

    const dataset = datasetDict[id];

    /*----------------------------------------------------------------------------------------------------------------*/

    if(dataset)
    {
        for(let i = 0; i < dataset.length; i++)
        {
            dataset[i].length = 0;
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(labelset)
    {
        labelset.length = 0;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
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

    delete props.metrics[widget.metric.id];

    delete widgetDict[widget.metric.id];

    delete datasetDict[widget.metric.id];

    delete labelsetDict[widget.metric.id];
};

/*--------------------------------------------------------------------------------------------------------------------*/

const toNumber = (def) => {

    /**/ if(def['<>'] === 'defNumber')
    {
        return Number(def['$']);
    }
    else if(def['<>'] === 'defSwitch')
    {
        return def['$'] === 'On' ? 1 : 0;
    }
    else if(def['<>'] === 'defLight')
    {
        switch(def['$'])
        {
            case 'Idle':
                return 0;
            case 'Ok':
                return 1;
            case 'Busy':
                return 2;
            case 'Alert':
                return 3;
        }
    }

    return Math.sqrt(-1);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const refreshContent = () => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* UPDATE DATA                                                                                                    */
    /*----------------------------------------------------------------------------------------------------------------*/

    const currentDate = new Date();

    /*----------------------------------------------------------------------------------------------------------------*/

    Object.keys(labelsetDict).filter((id) => {

        const metric = props.metrics[id];

        return (
            metric.plotMode === /**/'temporal'/**/
            &&
            metric.divider === ++counterDict[id]
        );

    }).forEach((id) => {

        counterDict[id] = 0;

        const dataset = datasetDict[id];

        const metric = props.metrics[id];

        if(metric.plotType === 'scatter')
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* SCATTER CART                                                                                           */
            /*--------------------------------------------------------------------------------------------------------*/

            for(let i = 0; i < dataset.length; i++)
            {
                const def1 = indiStore.resolve(metric.metric1[i]);
                const def2 = indiStore.resolve(metric.metric2[i]);

                if(def1 && def2)
                {
                    dataset[i].push({
                        x: toNumber(def1),
                        y: toNumber(def2),
                    });
                }
            }

            /*--------------------------------------------------------------------------------------------------------*/
        }
        else
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* TEMPORAL CART                                                                                          */
            /*--------------------------------------------------------------------------------------------------------*/

            for(let i = 0; i < dataset.length; i++)
            {
                const def = indiStore.resolve(metric.metric1[i]);

                if(def)
                {
                    dataset[i].push(toNumber(def));
                }
            }

            labelsetDict[id].push(currentDate);

            /*--------------------------------------------------------------------------------------------------------*/
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/
    /* UPDATE CHARTS                                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    for(let id in Chart.instances)
    {
        Chart.instances[id].update();
    }

    /*----------------------------------------------------------------------------------------------------------------*/
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

    if(indiStore.isConnected)
    {
        GridStack.initAll({removable: '#AAE7F472'}).forEach((grid) => {

            grid.on('resizestop', updateWidget);

            grid.on('dragstop', updateWidget);

            grid.on('removed', (e, items) => {

                items.forEach((item) => {

                    removeWidget(e, item.el);
                });
            });
        });

        /*------------------------------------------------------------------------------------------------------------*/

        Object.values(props.metrics).forEach((metric) => createWidget(metric, false));

        /*------------------------------------------------------------------------------------------------------------*/

        timer = setInterval(refreshContent, props.refreshInterval);

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    clearInterval(timer);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="h-100 d-flex flex-column">

        <nav-tabs margin="mb-1">

            <tab-pane class="align-items-center justify-content-center" :title="groupName" v-for="(groupName, groupIndex) in groups" :key="groupIndex">

                <div class="grid-stack h-100 w-100" :data-title="groupName"></div>

            </tab-pane>

            <template v-slot:button>

                <slot v-if="indiStore.isConnected"></slot>

            </template>

        </nav-tabs>

    </div>

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-primary ms-0" type="button" data-bs-placement="top" data-bs-title="Add a new widget" :disabled="!indiStore.isConnected" @click="newWidgetStep1(null)">
            <i class="bi bi-plus-lg"></i>
        </button>

        <button class="btn btn-danger ms-1" type="button" data-bs-placement="top" data-bs-title="Drop here to remove" :disabled="!indiStore.isConnected" id="AAE7F472">
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
                            <i class="bi bi-pencil"></i>
                            {{ state.id ? 'Edit' : 'New' }} metric
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <form class="modal-body px-3 py-2" @submit.prevent="newWidgetStep2" id="D1531250">

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label" for="D38EC0FA">Plot mode</label>
                                    <multiselect
                                        mode="single"
                                        id="D38EC0FA"
                                        :required="true"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="PLOT_MODES" v-model="state.plotMode" />
                                </div>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label" for="E9549BAB">Divider</label>
                                <input class="form-control form-control-sm" type="number" min="1" step="1" id="E9549BAB" placeholder="Divider" v-model="state.divider" :disabled="state.plotMode !== 'temporal'" required="required" />
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="F8E884DD">Plot type</label>
                                    <multiselect
                                        mode="single"
                                        id="F8E884DD"
                                        :required="true"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="PLOT_TYPES" v-model="state.plotType" />
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="F938E61B">Plot title<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Plot title" v-model="state.plotTitle" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="C8C721F4">Plot group</label>
                                    <multiselect
                                        mode="single"
                                        id="C8C721F4"
                                        :required="true"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :options="groups.map((x) => ({value: x, label: x}))" v-model="state.plotGroup" />
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="D8A97782">X title<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="D8A97782" placeholder="X title" v-model="state.xTitle" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="mb-3">
                                        <label class="form-label" for="EC986FF8">Y title<sup class="text-secondary">opt</sup></label>
                                        <input class="form-control form-control-sm" type="text" id="EC986FF8" placeholder="Y title" v-model="state.yTitle" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="C5306DB0" v-model="state.showLegend" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="C5306DB0">Show legend</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="CA52C0FD" v-model="state.xLogScale" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="CA52C0FD">X log scale</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="F39F6DAF" v-model="state.yLogScale" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="F39F6DAF">Y log scale</label>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="mb-3" v-if="state.plotType !== /**/''/**/">
                            <label class="form-label" for="BBA0018F">Y metric</label>
                            <multiselect
                                mode="tags"
                                id="BBA0018F"
                                :required="true"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="Object.keys(indiStore.variables || {}).map((x) => ({value: x, label: x}))" v-model="state.metric1" />
                        </div>

                        <div class="mb-3" v-if="state.plotType === 'scatter'">
                            <label class="form-label" for="B5D75D1E">X metric</label>
                            <multiselect
                                mode="tags"
                                id="B5D75D1E"
                                :required="true"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="Object.keys(indiStore.variables || {}).map((x) => ({value: x, label: x}))" v-model="state.metric2" />
                        </div>

                        <!-- *************************************************************************************** -->

                    </form>

                    <div class="modal-footer px-3 py-1">

                        <!-- *************************************************************************************** -->

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            <i class="bi bi-x-lg"></i> Cancel
                        </button>

                        <button class="btn btn-success" type="submit" form="D1531250" :disabled="!isValid">
                            <i class="bi bi-check-lg"></i> Add
                        </button>

                        <!-- *************************************************************************************** -->

                    </div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
