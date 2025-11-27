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

    <div class="row mx-0 w-100 text-start">

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-3">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]"></i>

            <span class="ms-1" tabindex="0" ref="popoverRef">{{ defSwitchVector['@label'] || defSwitchVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-7 text-center">

            <!-- *************************************************************************************************** -->
            <!-- ONE OF MANY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'OneOfMany'">

                <div class="btn-group btn-group-sm mb-1 w-75" role="group" v-if="defSwitchVector['children'].length < 4">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </button>
                </div>

                <select class="form-select form-select-sm mx-auto mb-1 w-100" :disabled="defSwitchVector['@perm'] === 'wo'" @change="sendMessage($event.target.value)" v-else>
                    <option :value="index" :selected="defSwitch['$'] === 'On'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index">
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </option>
                </select>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- AT MOST ONE                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'AtMostOne'">

                <div class="btn-group btn-group-sm mb-1 w-75" role="group">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        <i :class="['bi', {'bi-check-circle': defSwitch['$'] === 'On', 'bi-circle': defSwitch['$'] === 'Off'}]" v-if="defSwitchVector['children'].length > 1"></i>
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </button>
                </div>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- ANY OF MANY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'AnyOfMany'">

                <div class="btn-group btn-group-sm mb-1 w-75" role="group">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        <i :class="['bi', {'bi-check-square': defSwitch['$'] === 'On', 'bi-square': defSwitch['$'] === 'Off'}]" v-if="defSwitchVector['children'].length > 1"></i>
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </button>
                </div>

            </template>

            <!-- *************************************************************************************************** -->

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
