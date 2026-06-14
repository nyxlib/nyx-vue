<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, onMounted} from 'vue';

import {Popover} from 'bootstrap';

import {marked} from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/
/* CONSTANTS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const COLORS = {
    'Idle': 'secondary',
    'Ok': 'success',
    'Busy': 'warning',
    'Alert': 'danger',
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    defLightVector: {
        type: Object,
        default: () => {},
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

const popoverRef = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.defLightVector['@hints'])
    {
        /* NOSONAR */ new Popover(popoverRef.value, {
            html: true,
            trigger: 'focus hover',
            content: marked.parse(props.defLightVector['@hints'])
        });

        popoverRef.value.style.cursor = 'pointer';
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="row mx-0 w-100">

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-3" v-if="showStatus">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defLightVector['@state']]}`]"></i>

            <span class="ms-1" ref="popoverRef">{{ defLightVector['@label'] || defLightVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="[align ? (showStatus ? 'col-lg-7' : 'col-lg-10') : (showStatus ? 'col-lg-9' : 'col-lg-12'), 'text-center']">

            <div v-for="defLight in defLightVector['children']" :key="`${defLight['@name']}-${defLight['@rank']}`">

                <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defLight['$']]}`]"></i>

                {{ defLight['@label'] || defLight['@name'] }}

            </div>

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
