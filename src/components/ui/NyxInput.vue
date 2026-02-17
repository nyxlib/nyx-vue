<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    type: {
        type: String,
        required: true,
    },
    min: {
        type: [Number, String],
        default: undefined,
    },
    max: {
        type: [Number, String],
        default: undefined,
    },
    step: {
        type: [Number, String],
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
    modelValue: {
        type: Object,
        default: () => ({
            mode: 'val',
            val: '',
            var: '',
        }),
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
        mode: props.modelValue.mode !== 'val' ? 'val' : 'var',
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

        <input class="form-control form-control-sm" :type="type" :min="type === 'number' ? parseFloat(min) : undefined" :max="type === 'number' ? parseFloat(max) : undefined" :step="type === 'number' ? parseFloat(step) : undefined" :placeholder="placeholder" :id="id" v-model="nyxVal" v-if="modelValue.mode === 'val'" />

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
