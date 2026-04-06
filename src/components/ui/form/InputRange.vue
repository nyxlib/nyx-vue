<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'update:modelValue'
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    min: {
        type: Number,
        default: 0.0,
    },
    max: {
        type: Number,
        default: 100.0,
    },
    step: {
        type: Number,
        default: 1.0,
    },
    log: {
        type: Boolean,
        default: false,
    },
    modelValue: {
        type: Number,
        default: 0.0,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const effectiveMax = computed(() => props.log ? 100 : props.max - props.min);

const effectiveStep = computed(() => props.log ? effectiveMax.value / 100.0 : props.step);

const effectiveValue = computed(() => {

    if(!props.log)
    {
        return props.modelValue - props.min;
    }

    if(props.min <= 0.0 || props.max <= props.min || props.modelValue <= 0.0)
    {
        return 0.0;
    }

    return (Math.log(props.modelValue / props.min) / Math.log(props.max / props.min)) * effectiveMax.value;
});

/*--------------------------------------------------------------------------------------------------------------------*/

const handleInput = (e) => {

    const value = Number.parseFloat(e.target.value);

    return emit('update:modelValue', props.log ? Number((props.min * Math.pow(props.max / props.min, value / effectiveMax.value)).toPrecision(2)) : value + props.min);
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <input type="range" min="0" :max="effectiveMax" :step="effectiveStep" :value="effectiveValue" @input="handleInput" />

    <!-- *********************************************************************************************************** -->

</template>
