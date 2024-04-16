<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {inject} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');
const mqtt = inject('mqtt');

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    defSwitchVector: {
        type: Object,
        default: {},
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const colors = {
    'Idle': 'secondary',
    'Ok': 'success',
    'Busy': 'warning',
    'Alert': 'danger',
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const sendMessage = (index) => {

    const message = indi.buildNewSwitchVectorMessage(props.defSwitchVector, index);

    if(message)
    {
      mqtt.emit('indi/cmd/json', message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="row">

        <!-- ******************************************************************************************************* -->

        <label class="col-sm-2 text-start">
            <span :class="`text-${colors[defSwitchVector['@state']]}`">
                <i class="bi bi-circle-fill"></i>
            </span>
            {{ defSwitchVector['@label'] || defSwitchVector['@name'] }}
        </label>

        <!-- ******************************************************************************************************* -->

        <div class="col-sm-10 text-center">
            <div class="btn-group btn-group-sm mb-1 w-50" role="group">

                <button class="btn" :class="{'btn-primary': defSwitch['$'] === 'On', 'btn-outline-secondary': defSwitch['$'] === 'Off', 'disabled': defSwitchVector['@perm'] === 'wo'}" :style="{'width': `${100.0 / props.defSwitchVector['children'].length}%`}" v-for="(defSwitch, index) in defSwitchVector['children']" :key="index" @click="sendMessage(index)">
                    {{ defSwitch['@label'] || defSwitch['@name'] }}
                </button>

            </div>
        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
