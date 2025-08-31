<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject} from 'vue';
import Sexagesimal from "../ui/Sexagesimal.vue";

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
});

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

const sendMessage = () => {

    const message = nyx.buildNewNumberVectorMessage(props.defNumberVector);

    if(message)
    {
        props.defNumberVector['@state'] = 'Busy';

        mqtt.emit('nyx/cmd/json', message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="row mx-0 w-100">

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-3">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defNumberVector['@state']]}`]"></i>

            {{ defNumberVector['@label'] || defNumberVector['@name'] }}

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="{'col-lg-9': defNumberVector['@perm'] === 'ro', 'col-lg-7': defNumberVector['@perm'] !== 'ro'}">

            <template v-for="defNumber in defNumberVector['children']" :key="defNumber">

                <div class="input-group input-group-sm mb-1">

                    <span class="input-group-text" style="min-width: 175px;">
                        {{ defNumber['@label'] || defNumber['@name'] }}
                    </span>

                    <sexagesimal :format="defNumber['@format']" v-model="defNumber['$']" :readonly="defNumberVector['@perm'] === 'ro'" v-if="defNumber['@format'].match(/%(\d+)\.(\d+)m/)" />

                    <input class="form-control" :type="defNumberVector['@perm'] === 'ro' ? 'text' : 'number'" :min="defNumber['@min']" :max="defNumber['@max']" :step="defNumber['@step']" :readonly="defNumberVector['@perm'] === 'ro'" v-model="defNumber['$']" v-else />

                </div>

            </template>

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-2 mb-1" v-if="defNumberVector['@perm'] !== 'ro'">

            <button class="btn btn-xs btn-outline-primary h-100 w-100" @click="sendMessage">
                Apply
            </button>

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
