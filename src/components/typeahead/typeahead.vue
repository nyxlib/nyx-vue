<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { ref, watch, computed, defineProps, defineEmits } from 'vue';

import 'bootstrap/js/src/dropdown';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'update:modelValue'
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    mode: {
        type: String,
        default: 'select',
        validator: (mode) => mode === 'select' || mode === 'typeahead',
    },
    options: {
        type: Array,
        default: () => [],
        validator: (options) => options.every(option => option.hasOwnProperty('value') && option.hasOwnProperty('label'))
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const localModelValue = ref(props.modelValue);

/*--------------------------------------------------------------------------------------------------------------------*/

const filteredOptions = computed(() => props
    .options.filter((option) => !localModelValue.value || option.value.includes(localModelValue.value) || option.label.includes(localModelValue.value))
    .sort((option1, option2) => option1.label.toLowerCase().localeCompare(option2.label.toLowerCase()))
);

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, (modelValue) => {

    localModelValue.value = modelValue;
});

/*--------------------------------------------------------------------------------------------------------------------*/

const updateValue = (value) => {

    localModelValue.value = value;

    emit('update:modelValue', value);
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- MODE SELECT                                                                                                 -->
    <!-- *********************************************************************************************************** -->

    <select v-bind="$attrs" v-if="mode === 'select'" :value="localModelValue" @input="updateValue($event.target.value)">
        <option :value="option.value" v-for="option in options">
            {{option.label}}
        </option>
    </select>

    <!-- *********************************************************************************************************** -->
    <!-- MODE TYPEAHEAD                                                                                              -->
    <!-- *********************************************************************************************************** -->

    <div v-bind="$attrs" v-if="mode === 'typeahead'">

        <div class="dropdown position-static">

            <input type="text" :value="localModelValue" @input="updateValue($event.target.value)" data-bs-toggle="dropdown" />

            <ul class="dropdown-menu">
                <li v-for="option in filteredOptions">
                    <a class="dropdown-item" href="#" @click.prevent="updateValue(option.value)">
                        {{option.label}}
                    </a>
                </li>
            </ul>

        </div>

    </div>

    <!-- *********************************************************************************************************** -->

</template>

<style scoped>
/*--------------------------------------------------------------------------------------------------------------------*/

input {
    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    outline: none;
    width: 100%;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
