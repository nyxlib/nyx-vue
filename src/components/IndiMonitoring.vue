<!--suppress HtmlUnknownAttribute -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {h, ref, inject, render, computed, onMounted, onUnmounted} from 'vue';

import Multiselect from '@vueform/multiselect';

import {Modal, Tooltip} from 'bootstrap';

import {GridStack} from 'gridstack';

import Chart from 'chart.js/auto';

import {v4} from 'uuid';

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

const plotMode = ref('');
const plotType = ref('');
const plotTitle = ref('');
const plotGroup = ref('');
const xTitle = ref('');
const yTitle = ref('');
const showLegend = ref(false);
const xLogScale = ref(false);
const yLogScale = ref(false);
const metric1 = ref([]);
const metric2 = ref([]);

/*--------------------------------------------------------------------------------------------------------------------*/

const labelset_dict = {};
const dataset_dict = {};

let timer = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const isValid = computed(() => !!plotGroup.value && metric1.value.length > 0 && (plotType.value !== 'scatter' || metric1.value.length === metric2.value.length));

/*--------------------------------------------------------------------------------------------------------------------*/

const newWidgetStep1 = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    plotMode.value = 'temporal';
    plotType.value = 'line';
    plotTitle.value = '';
    plotGroup.value = '';
    xTitle.value = '';
    yTitle.value = '';
    showLegend.value = false;
    xLogScale.value = false;
    yLogScale.value = false;
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
        plotMode: plotMode.value,
        plotType: plotType.value,
        plotTitle: plotTitle.value,
        plotGroup: plotGroup.value,
        xTitle: xTitle.value,
        yTitle: yTitle.value,
        showLegend: showLegend.value,
        xLogScale: xLogScale.value,
        yLogScale: yLogScale.value,
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
            content: `<i class="bi bi-eraser-fill position-absolute" style="right: -0.00rem; top: -0.25rem;"></i>`,
        });

        /*------------------------------------------------------------------------------------------------------------*/

        widget.querySelector('.bi-eraser-fill').onclick = () => clearWidget(metric.id);

        /*------------------------------------------------------------------------------------------------------------*/

        labelset_dict[metric.id] = metric.plotType === 'scatter' ? null : [];

        dataset_dict[metric.id] = metric.metric1.map(() => []);

        props.metrics[metric.id] = widget.metric = metric;

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
            labelset: labelset_dict[metric.id],
            dataset: dataset_dict[metric.id],
        });

        /*------------------------------------------------------------------------------------------------------------*/

        render(chart, widget.firstElementChild);

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const clearWidget = (id) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const labelset = labelset_dict[id];

    const dataset = dataset_dict[id];

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

    delete labelset_dict[widget.metric.id];

    delete dataset_dict[widget.metric.id];
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

    Object.keys(labelset_dict).filter((id) => props.metrics[id].plotMode === 'temporal').forEach((id) => {

        const dataset = dataset_dict[id];

        const metric = props.metrics[id];

        if(metric.plotType === 'scatter')
        {
            /*--------------------------------------------------------------------------------------------------------*/
            /* SCATTER CART                                                                                           */
            /*--------------------------------------------------------------------------------------------------------*/

            for(let i = 0; i < dataset.length; i++)
            {
                const def1 = indiStore.resolve(null, metric.metric1[i]);
                const def2 = indiStore.resolve(null, metric.metric2[i]);

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
                const def = indiStore.resolve(null, metric.metric1[i]);

                if(def)
                {
                    dataset[i].push(toNumber(def));
                }
            }

            labelset_dict[id].push(currentDate);

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

    <div class="h-100 d-flex flex-column">

        <nav-tabs margin="mb-1">

            <tab-pane class="align-items-center justify-content-center" :title="groupName" v-for="(groupName, groupIndex) in groups" :key="groupIndex">

                <div class="grid-stack h-100 w-100" :data-title="groupName"></div>

            </tab-pane>

        </nav-tabs>

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
                                    <label class="form-label" for="D38EC0FA">Plot mode</label>
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
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="F8E884DD">Plot type</label>
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
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="F938E61B">Plot title<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="F938E61B" placeholder="Plot title" v-model="plotTitle" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="C8C721F4">Plot group</label>
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

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label" for="D8A97782">X title<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="D8A97782" placeholder="X title" v-model="xTitle" />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="mb-3">
                                        <label class="form-label" for="EC986FF8">Y title<sup class="text-secondary">opt</sup></label>
                                        <input class="form-control form-control-sm" type="text" id="EC986FF8" placeholder="Y title" v-model="yTitle" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="C5306DB0" v-model="showLegend" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="C5306DB0">Show legend</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="CA52C0FD" v-model="xLogScale" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="CA52C0FD">X log scale</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="F39F6DAF" v-model="yLogScale" :true-value="true" :false-value="false" />
                                    <label class="form-check-label" for="F39F6DAF">Y log scale</label>
                                </div>
                            </div>
                        </div>

                        <!-- *************************************************************************************** -->

                        <div class="mb-3" v-if="plotType !== /**/''/**/">
                            <label class="form-label" for="BBA0018F">1st metric</label>
                            <multiselect
                                mode="tags"
                                id="BBA0018F"
                                :searchable="true"
                                :create-option="false"
                                :close-on-select="true"
                                :options="Object.keys(indiStore.variables || {}).map((x) => ({value: x, label: x}))" v-model="metric1" />
                        </div>

                        <div class="mb-3" v-if="plotType === 'scatter'">
                            <label class="form-label" for="B5D75D1E">2st metric</label>
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
                            Add
                        </button>

                        <!-- *************************************************************************************** -->

                    </div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
