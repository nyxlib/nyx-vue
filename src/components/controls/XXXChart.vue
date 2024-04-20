<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted} from 'vue';

import Chart from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    mode: {
        type: String,
        default: 'temporal',
        validator: (value) => ['temporal', 'blob'].includes(value),
    },
    type: {
        type: String,
        default: 'line',
        validator: (value) => ['line', 'bar', 'doughnut', 'polar', 'radar', 'scatter'].includes(value),
    },
    title: {
        type: String,
        default: '',
    },
    xTitle: {
        type: String,
        default: '',
    },
    yTitle: {
        type: String,
        default: '',
    },
    showLegend: {
        type: Boolean,
        default: false,
    },
    xLogScale: {
        type: Boolean,
        default: false,
    },
    yLogScale: {
        type: Boolean,
        default: false,
    },
    metric1Names: {
        type: Array,
        default: [],
    },
    metric2Names: {
        type: Array,
        default: [],
    },
    labelset: {
        type: Array,
        default: [],
    },
    dataset: {
        type: Array,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const canvas = ref(null);

let chart = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.metric1Names.length !== props.dataset.length)
    {
        alert(`Internal error (${props.metric1Names.length}, ${props.dataset.length})!`);

        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const props_labelset = props.type === 'scatter' ? /**/ null /**/
                                                    : props.labelset
    ;

    /*----------------------------------------------------------------------------------------------------------------*/

    const props_datasets = props.metric1Names.map((label, index) => {

        return {
            label: label,
            data: props.dataset[index],
            pointRadius: props.type === 'scatter' ? 2 : 0,
            borderWidth: 1.0,
            tension: 0.1,
        };
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    const scale_x = {
        title: {
            display: !!props.xTitle,
            text: props.xTitle,
        }
    };

    if(props.xLogScale) {
        scale_x.type = 'logarithmic';
    }

    const scale_y = {
        title: {
            display: !!props.yTitle,
            text: props.yTitle,
        }
    };

    if(props.yLogScale) {
        scale_y.type = 'logarithmic';
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(props.mode === 'temporal' && props.type !== 'scatter')
    {
        scale_x.type = 'time';

        scale_x.time = {
            displayFormats: {
                millisecond: 'HH:mm:ss',
                second: 'HH:mm:ss',
                minute: 'HH:mm:ss',
                hour: 'HH:mm:ss',
                day: 'HH:mm:ss',
                week: 'HH:mm:ss',
                month: 'HH:mm:ss',
                quarter: 'HH:mm:ss',
                year: 'HH:mm:ss',
            },
        };
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    chart = new Chart(canvas.value, {
        type: props.type,
        data: {
            labels: props_labelset,
            datasets: props_datasets,
        },
        options: {
            scales: {
                x: scale_x,
                y: scale_y,
            },
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
