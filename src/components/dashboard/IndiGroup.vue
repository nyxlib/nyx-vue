<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import IndiTextVector from '../indi/IndiTextVector.vue';
import IndiNumberVector from '../indi/IndiNumberVector.vue';
import IndiSwitchVector from '../indi/IndiSwitchVector.vue';
import IndiLightVector from '../indi/IndiLightVector.vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

defineProps({
    groupInfo: {
        type: Object,
        default: {},
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div v-for="defXXXVector in Object.values(groupInfo)">

        <indi-text-vector :def-text-vector="defXXXVector" v-if="defXXXVector['<>'] === 'defTextVector'" />

        <indi-number-vector :def-number-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defNumberVector'" />

        <indi-switch-vector :def-switch-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defSwitchVector'" />

        <indi-light-vector :def-light-vector="defXXXVector" v-else-if="defXXXVector['<>'] === 'defLightVector'" />

    </div>

    <!-- *********************************************************************************************************** -->

</template>
