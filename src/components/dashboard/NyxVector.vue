<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import NyxTextVector from '../nyx/NyxTextVector.vue';
import NyxNumberVector from '../nyx/NyxNumberVector.vue';
import NyxSwitchVector from '../nyx/NyxSwitchVector.vue';
import NyxLightVector from '../nyx/NyxLightVector.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    defXXXVector: {
        type: Object,
        default: () => {},
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <nyx-text-vector :def-text-vector="defXXXVector" v-if="defXXXVector['<>'] === 'defTextVector'" />

    <nyx-number-vector :def-number-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defNumberVector'" />

    <nyx-switch-vector :def-switch-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defSwitchVector'" />

    <nyx-light-vector :def-light-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defLightVector'" />

    <!-- *********************************************************************************************************** -->

</template>
