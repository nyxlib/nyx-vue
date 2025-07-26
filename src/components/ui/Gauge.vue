<!--suppress PointlessArithmeticExpressionJS -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    ranges: {
        type: Array,
        required: true,
        validator: (val) => val.length >= 2,
    },
    colors: {
        type: Array,
        required: true,
        validator: (val) => val.length >= 1,
    },
    value: {
        type: Number,
        default: Number.NaN,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const underflowSize = 0.1; // 10%
const overflowSize = 0.1; // 10%

/*--------------------------------------------------------------------------------------------------------------------*/

const getGradient = function()
{
    /*----------------------------------------------------------------------------------------------------------------*/

    const centralSize = 1.0 - underflowSize - overflowSize;

    const totalRangeSize = props.ranges[props.ranges.length - 1] - props.ranges[0];

    const centralProportions = props.ranges.slice(1, -1).map(x => underflowSize + (x - props.ranges[0]) / totalRangeSize * centralSize);

    /*----------------------------------------------------------------------------------------------------------------*/

    return [0.0, underflowSize, ...centralProportions, 1.0 - overflowSize, 1.0];

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const gradient = computed(() => {

    const parts = [];

    const gradient = getGradient();

    for(let i = 0; i < gradient.length - 1; i++)
    {
        const color = props.colors[i];

        const start = gradient[i + 0];
        const stop = gradient[i + 1];

        parts.push(`${color} ${start * 100}%, ${color} ${stop * 100}%`);
    }

    return `linear-gradient(to right, ${parts.join(', ')})`;
});

/*--------------------------------------------------------------------------------------------------------------------*/

const position = computed(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const gradient = getGradient();

    /*----------------------------------------------------------------------------------------------------------------*/

    const l = gradient.length;

    if(props.value < props.ranges[0])
    {
        return (gradient[0] + gradient[1]) / 2;
    }

    if(props.value > props.ranges[l - 1])
    {
        return (gradient[l - 1] + gradient[l - 2]) / 2;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    for(let i = 0; i < props.ranges.length - 1; i++)
    {
        const rangeStart = props.ranges[i + 0];
        const rangeStop = props.ranges[i + 1];

        if(props.value >= rangeStart
            &&
            props.value <= rangeStop
        ) {
            const gradientStart = gradient[i + 1];
            const gradientStop = gradient[i + 2];

            return gradientStart + (props.value - rangeStart) * (gradientStop - gradientStart) / (rangeStop - rangeStart);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return props.value < props.ranges[0] ? 0.0
                                         : 1.0
    ;

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <input type="range" :class="{'px-0': true, 'py-1': true, 'no-thumb': Number.isNaN(value)}" min="0.0" max="1.0" step="0.01" :value="position" :style="{background: gradient, opacity: 0.5}" :disabled="true" />

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

.no-thumb::-moz-range-thumb {
    appearance: none;
    -moz-appearance: none;
    background: transparent;
    border: none;
}

.no-thumb::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: none;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
