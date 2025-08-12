<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {watch, reactive} from 'vue';

import Multiselect from '@vueform/multiselect';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'update:modelValue'
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const localDevices = reactive(Object.fromEntries(nyxStore.categoryDefs.map((categoryDef) => [categoryDef.value, props.modelValue?.[categoryDef.value]])));

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

function setDevice(category, device)
{
    localDevices[category] = device;

    emit('update:modelValue', {...localDevices});
}

/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, (modelValue) => {

    for(const def of nyxStore.categoryDefs)
    {
        localDevices[def.value] = modelValue?.[def.value];
    }

}, {deep: false});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="card">
        <div class="card-header px-3 py-2">
            Devices
        </div>
        <div class="card-body px-3 py-2">

            <div class="row">
                <div class="col-md-6" v-for="([a, b], idx) in [[0, 8], [8, 16]]" :key="idx">

                    <!-- ******************************************************************************************* -->

                    <table class="table table-sm table-striped">

                        <!-- *************************************************************************************** -->

                        <thead>
                            <tr>
                                <th class="text-start" style="width: 200px;">
                                    Category
                                </th>
                                <th class="text-center" style="width: auto;">
                                    Device
                                </th>
                            </tr>
                        </thead>

                        <!-- *************************************************************************************** -->

                        <tbody>
                            <tr v-for="categoryDef in nyxStore.categoryDefs.slice(a, b)" :key="categoryDef.value">
                                <td class="text-center">
                                    {{ categoryDef.label }}
                                </td>
                                <td class="text-center">
                                    <multiselect
                                        mode="single"
                                        :can-clear="false"
                                        :searchable="true"
                                        :create-option="false"
                                        :close-on-select="true"
                                        :disabled="!nyxStore.isConnected"
                                        :options="nyxStore.deviceDefs"
                                        :model-value="localDevices[categoryDef.value]"
                                        @update:model-value="(value) => setDevice(categoryDef.value, value)" />
                                </td>
                            </tr>
                        </tbody>

                        <!-- *************************************************************************************** -->

                    </table>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>

        </div>
    </div>

    <!-- *********************************************************************************************************** -->

</template>
