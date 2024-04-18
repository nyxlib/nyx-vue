<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted} from 'vue';

import Chart from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    type: {
        type: String,
        default: 'line',
        validator: (value) => ['line', 'bar', 'doughnut', 'polar', 'radar', 'scatter'].includes(value),
    },
    title: {
        type: String,
        default: '',
    },
    showLegend: {
        type: Boolean,
        default: false,
    },
    metricNames: {
        type: Array,
        default: [],
    },
    labelset: {
        type: Array,
        default: [],
    },
    dataset: {
        type: Array,
        default: [],
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const canvas = ref(null);

let chart = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.metricNames.length !== props.dataset.length)
    {
        alert(`Internal error (${props.metricNames.length}, ${props.dataset.length})!`);

        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const props_datasets = props.metricNames.map((metricsName, index) => {

        return {
            label: metricsName,
            data: props.dataset[index],
            borderWidth: 1,
            tension: 0.1,
        };
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    chart = new Chart(canvas.value, {
        type: props.type,
        data: {
            labels: props.labelset,
            datasets: props_datasets,
        },
        options: {
            animation: {
                duration: 0,
            },
            responsive: true,
            plugins: {
                title: {
                    display: !!props.title,
                    text: props.title,
                },
                legend: {
                    display: props.showLegend,
                },
            },
        },
    });

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <canvas class="h-100 w-100" ref="canvas"></canvas>

    <!-- *********************************************************************************************************** -->

</template>
