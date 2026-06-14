<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, onMounted} from 'vue';

import {Popover} from 'bootstrap';

import {marked} from 'marked';

/*--------------------------------------------------------------------------------------------------------------------*/

import Sexagesimal from '../ui/form/Sexagesimal.vue';

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
    defNumberVector: {
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

const sendMessage = () => {

    const message = nyx.buildNewNumberVectorMessage(props.defNumberVector);

    if(message)
    {
        props.defNumberVector['@state'] = 'Busy';

        mqtt.emit('nyx/cmd/json', message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.defNumberVector['@hints'])
    {
        /* NOSONAR */ new Popover(popoverRef.value, {
            html: true,
            trigger: 'focus hover',
            content: marked.parse(props.defNumberVector['@hints'])
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

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defNumberVector['@state']]}`]"></i>

            <span class="ms-1" ref="popoverRef">{{ defNumberVector['@label'] || defNumberVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="[align || direction === 'col' ? (showStatus ? 'col-lg-7' : 'col-lg-10') : (showStatus ? 'col-lg-9' : 'col-lg-12')]">

            <!-- *************************************************************************************************** -->

            <template v-for="defNumber in defNumberVector['children']" :key="defNumber">

                <div class="input-group input-group-sm mb-1">

                    <span class="input-group-text" style="min-width: 200px;">
                        {{ defNumber['@label'] || defNumber['@name'] }}
                    </span>

                    <sexagesimal :format="defNumber['@format']" :readonly="defNumberVector['@perm'] === 'ro'" v-model="defNumber['$']" v-if="defNumber['@format'].match(/%(\d+)\.(\d+)m/)" />

                    <input class="form-control" :type="defNumberVector['@perm'] === 'ro' ? 'text' : 'number'" :min="defNumber['@min']" :max="defNumber['@max']" :step="defNumber['@step']" :readonly="defNumberVector['@perm'] === 'ro'" v-model="defNumber['$']" v-else />

                </div>

            </template>

            <!-- *************************************************************************************************** -->

            <div class="pb-1" v-if="defNumberVector['@perm'] !== 'ro' && direction === 'row'">

                <button class="btn btn-sm btn-primary position-relative h-100 w-100" @click="sendMessage">
                    <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defNumberVector['@state']]}`]" style="top: calc(0.25rem + 1px); left: 0.5rem;" v-if="!showStatus"></i>
                    Apply
                </button>

            </div>

            <!-- *************************************************************************************************** -->

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-2 pb-1" v-if="defNumberVector['@perm'] !== 'ro' && direction === 'col'">

            <button class="btn btn-sm btn-primary position-relative h-100 w-100" @click="sendMessage">
                <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defNumberVector['@state']]}`]" style="top: calc(0.25rem + 1px); left: 0.5rem;" v-if="!showStatus"></i>
                Apply
            </button>

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
