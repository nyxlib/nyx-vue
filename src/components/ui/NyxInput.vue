<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, computed, reactive} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
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
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    showNyxVar: false,
});

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxVal = computed({

    get: () => props.modelValue.val ?? '',
    set: (x) => {

        emit('update:modelValue', {
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
            val: props.modelValue.val ?? '',
            var: x,
        });
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const toggle = () => {

    state.showNyxVar = !state.showNyxVar;
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue.var, (x) => {

    state.showNyxVar = (typeof x === 'string' && x.trim().length > 0);

}, {immediate: true});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="input-group input-group-sm">

        <!-- ******************************************************************************************************* -->

        <input class="form-control form-control-sm" :type="type" :min="type === 'number' ? min : undefined" :max="type === 'number' ? max : undefined" :step="type === 'number' ? step : undefined" :placeholder="placeholder" :id="id" v-model="nyxVal" v-if="!state.showNyxVar" />

        <!-- ******************************************************************************************************* -->

        <input class="form-control form-control-sm" type="text" placeholder="Nyx variable" v-model.trim="nyxVar" v-if="state.showNyxVar" />

        <!-- ******************************************************************************************************* -->

        <button :class="['btn', {'btn-outline-secondary': !state.showNyxVar, 'btn-outline-primary': state.showNyxVar}]" type="button" @click="toggle">
            <i class="bi bi-braces"></i>
        </button>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
