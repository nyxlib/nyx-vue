<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed, defineEmits} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'update:modelValue'
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: Number,
        default: 0.0,
    },
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
});

/*--------------------------------------------------------------------------------------------------------------------*/

const effectiveMax = computed(() => props.log ? 100 : props.max - props.min);

const effectiveStep = computed(() => props.log ? effectiveMax.value / 100.0 : props.step);

const effectiveValue = computed(() => props.log ? (Math.log(props.modelValue / props.min) / Math.log(props.max / props.min)) * effectiveMax.value : props.modelValue - props.min);

/*--------------------------------------------------------------------------------------------------------------------*/

const handleInput = (e) => { const v = parseFloat(e.target.value); return emit('update:modelValue', props.log ? (props.min * Math.pow(props.max / props.min, v / effectiveMax.value)).toPrecision(2) : v + props.min); };

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <input type="range" min="0" :max="effectiveMax" :step="effectiveStep" :value="effectiveValue" @input="handleInput" />

    <!-- *********************************************************************************************************** -->

</template>
