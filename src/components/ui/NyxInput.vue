<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: Object,
        required: false,
        default: () => ({
            mode: 'val',
            val: '',
            var: '',
        }),
    },
    type: {
        type: String,
        required: true,
    },
    min: {
        type: Number,
        default: undefined,
    },
    max: {
        type: Number,
        default: undefined,
    },
    step: {
        type: Number,
        default: undefined,
    },
    placeholder: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: () => uuid.v4(),
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxVal = computed({

    get: () => props.modelValue.val ?? '',
    set: (x) => {

        emit('update:modelValue', {
            mode: 'val',
            var: props.modelValue.var ?? '',
            val: x,
        });
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxVar = computed({

    get: () => props.modelValue.var ?? '',
    set: (x) => {

        emit('update:modelValue', {
            mode: 'var',
            val: props.modelValue.val ?? '',
            var: x,
        });
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const toggle = () => {

    emit('update:modelValue', {
        mode: props.modelValue.mode === 'var' ? 'val' : 'var',
        val: props.modelValue.val ?? '',
        var: props.modelValue.var ?? '',
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="input-group input-group-sm">

        <!-- ******************************************************************************************************* -->

        <input class="form-control form-control-sm" :type="type" :min="type === 'number' ? min : undefined" :max="type === 'number' ? max : undefined" :step="type === 'number' ? step : undefined" :placeholder="placeholder" :id="id" v-model="nyxVal" v-if="modelValue.mode === 'val'" />

        <!-- ******************************************************************************************************* -->

        <input class="form-control form-control-sm" type="text" placeholder="Nyx variable" v-model.trim="nyxVar" v-if="modelValue.mode === 'var'" />

        <!-- ******************************************************************************************************* -->

        <button :class="['btn', {'btn-outline-secondary': modelValue.mode === 'val', 'btn-outline-primary': modelValue.mode === 'var'}]" type="button" @click="toggle">
            <i class="bi bi-braces"></i>
        </button>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
