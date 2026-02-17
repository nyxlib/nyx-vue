<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {computed} from 'vue';

import * as uuid from 'uuid';

import Multiselect from '@vueform/multiselect';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

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

        <input class="form-control form-control-sm"
               :type="type"
               :min="parseFloat(min)"
               :max="parseFloat(max)"
               :step="parseFloat(step)"
               :placeholder="placeholder"
               :readonly="modelValue.mode === 'var'"
               :id="id"
               v-model.number="nyxVal"
               v-if="type === 'number'"
        />

        <!-- ******************************************************************************************************* -->

        <input class="form-control form-control-sm"
               :type="type"
               :placeholder="placeholder"
               :readonly="modelValue.mode === 'var'"
               :id="id"
               v-model.trim="nyxVal"
               v-if="type !== 'number'"
        />

        <!-- ******************************************************************************************************* -->

        <multiselect mode="single"
                     :required="false"
                     :can-clear="true"
                     :searchable="true"
                     :create-option="false"
                     :allow-absent="true"
                     :close-on-select="true"
                     :options="nyxStore.variableDefs"
                     :id="id"
                     v-model.trim="nyxVar"
                     v-if="modelValue.mode === 'var'"
        />

        <!-- ******************************************************************************************************* -->

        <button :class="['btn', {'btn-outline-secondary': modelValue.mode === 'val', 'btn-outline-primary': modelValue.mode === 'var'}]" type="button" @click="toggle">
            <i class="bi bi-braces"></i>
        </button>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
