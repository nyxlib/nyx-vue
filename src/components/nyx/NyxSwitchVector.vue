<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, onMounted} from 'vue';

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

const nyx = inject('nyx');
const mqtt = inject('mqtt');

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    defSwitchVector: {
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
        /* NOSONAR */ new Popover(popoverRef.value, {
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

    <div class="row">

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-3" v-if="showStatus">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]"></i>

            <span class="ms-1" ref="popoverRef">{{ defSwitchVector['@label'] || defSwitchVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="[align ? (showStatus ? 'col-lg-7' : 'col-lg-10') : (showStatus ? 'col-lg-9' : 'col-lg-12'), 'text-center']">

            <!-- *************************************************************************************************** -->
            <!-- ONE OF MANY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'OneOfMany'">

                <div class="btn-group btn-group-sm mb-1 w-75" v-if="defSwitchVector['children'].length < 4">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]" style="top: calc(0.25rem + 1px); left: 0.5rem;" v-if="index === 0 && !showStatus"></i>
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </button>
                </div>

                <div class="input-group input-group-sm mb-1" v-else>
                    <span class="input-group-text" v-if="!showStatus">
                        <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]"></i>
                    </span>
                    <select class="form-select" :disabled="defSwitchVector['@perm'] === 'wo'" @change="sendMessage($event.target.value)">
                        <option :value="index" :selected="defSwitch['$'] === 'On'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index">
                            {{ defSwitch['@label'] || defSwitch['@name'] }}
                        </option>
                    </select>
                </div>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- AT MOST ONE                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'AtMostOne'">

                <div class="btn-group btn-group-sm mb-1 w-75">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]" style="top: calc(0.25rem + 1px); left: 0.5rem;" v-if="index === 0 && !showStatus"></i>
                        <i :class="['bi', {'bi-check-circle': defSwitch['$'] === 'On', 'bi-circle': defSwitch['$'] === 'Off'}]" v-if="defSwitchVector['children'].length > 1"></i>
                        {{ defSwitch['@label'] || defSwitch['@name'] }}
                    </button>
                </div>

            </template>

            <!-- *************************************************************************************************** -->
            <!-- ANY OF MANY                                                                                         -->
            <!-- *************************************************************************************************** -->

            <template v-if="defSwitchVector['@rule'] === 'AnyOfMany'">

                <div class="btn-group btn-group-sm mb-1 w-75">
                    <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" :disabled="defSwitchVector['@perm'] === 'wo'" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                        <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defSwitchVector['@state']]}`]" style="top: calc(0.25rem + 1px); left: 0.5rem;" v-if="index === 0 && !showStatus"></i>
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
