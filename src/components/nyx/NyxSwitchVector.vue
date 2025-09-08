<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, onMounted} from 'vue';

import {Popover} from 'bootstrap';

import {marked} from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyx = inject('nyx');
const mqtt = inject('mqtt');

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    defSwitchVector: {
        type: Object,
        default: () => {},
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const popoverRef = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

const COLORS = {
    'Idle': 'secondary',
    'Ok': 'success',
    'Busy': 'warning',
    'Alert': 'danger',
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const sendMessage = (index) => {

    const message = nyx.buildNewSwitchVectorMessage(props.defSwitchVector, index);

    if(message)
    {
        props.defSwitchVector['@state'] = 'Busy';

        mqtt.emit('nyx/cmd/json', message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.defSwitchVector['@hints'])
    {
        new Popover(popoverRef.value, {
            html: true,
            trigger: 'focus hover',
            content: marked.parse(props.defSwitchVector['@hints'])
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

        <div class="col-lg-2 text-start">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]"></i>

            <span class="ms-1" tabindex="0" ref="popoverRef">{{ defSwitchVector['@label'] || defSwitchVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-10 text-center">
            <div class="btn-group btn-group-sm mb-1 w-50" role="group">

                <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off', 'disabled': defSwitchVector['@perm'] === 'wo'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">

                    <i :class="['bi', {'bi-check-square': defSwitch['$'] === 'On', 'bi-square': defSwitch['$'] === 'Off'}]" v-if="defSwitchVector['@rule'] === 'AnyOfMany'"></i>

                    {{ defSwitch['@label'] || defSwitch['@name'] }}

                </button>

            </div>
        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
