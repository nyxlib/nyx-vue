<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import NyxSwitchVector from '../nyx/NyxSwitchVector.vue';
import NyxLightVector from '../nyx/NyxLightVector.vue';
import NyxTextVector from '../nyx/NyxTextVector.vue';
import NyxNumberVector from '../nyx/NyxNumberVector.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    groupDescr: {
        type: [Object, Array],
        default: () => [],
    },
    align: {
        type: Boolean,
        default: true,
    },
    direction: {
        type: String,
        default: 'col',
        validator: (value) => ['row', 'column'].includes(value),
    },
    showStatus: {
        type: Boolean,
        default: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <template v-for="defXXXVector in Object.prototype.toString.call(groupDescr) === '[object Object]' ? Object.values(groupDescr) : groupDescr" :key="defXXXVector">

        <nyx-text-vector :def-text-vector="defXXXVector" :align="align" :direction="direction" :show-status="showStatus" v-if="defXXXVector['<>'] === 'defTextVector'" />

        <nyx-number-vector :def-number-vector="defXXXVector" :align="align" :direction="direction" :show-status="showStatus" v-else-if="defXXXVector['<>'] === 'defNumberVector'" />

        <nyx-switch-vector :def-switch-vector="defXXXVector" :align="align" :direction="direction" :show-status="showStatus" v-else-if="defXXXVector['<>'] === 'defSwitchVector'" />

        <nyx-light-vector :def-light-vector="defXXXVector" :align="align" :direction="direction" :show-status="showStatus" v-else-if="defXXXVector['<>'] === 'defLightVector'" />

    </template>

    <!-- *********************************************************************************************************** -->

</template>
