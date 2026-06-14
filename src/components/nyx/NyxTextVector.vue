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
    defTextVector: {
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

    const message = nyx.buildNewTextVectorMessage(props.defTextVector);

    if(message)
    {
        props.defTextVector['@state'] = 'Busy';

        mqtt.emit('nyx/cmd/json', message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    if(props.defTextVector['@hints'])
    {
        /* NOSONAR */ new Popover(popoverRef.value, {
            html: true,
            trigger: 'focus hover',
            content: marked.parse(props.defTextVector['@hints'])
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

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defTextVector['@state']]}`]"></i>

            <span class="ms-1" ref="popoverRef">{{ defTextVector['@label'] || defTextVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="[align || direction === 'col' ? (showStatus ? 'col-lg-7' : 'col-lg-10') : (showStatus ? 'col-lg-9' : 'col-lg-12')]">

            <!-- *************************************************************************************************** -->

            <template v-for="defText in defTextVector['children']" :key="defText">

                <div class="input-group input-group-sm mb-1">

                    <span class="input-group-text" style="min-width: 200px;">
                        {{ defText['@label'] || defText['@name'] }}
                    </span>

                    <input class="form-control" type="text" :readonly="defTextVector['@perm'] === 'ro'" v-model="defText['$']" />

                </div>

            </template>

            <!-- *************************************************************************************************** -->

            <div v-if="props.defTextVector['@perm'] !== 'ro' && direction === 'row'">

                <button class="btn btn-sm btn-outline-primary h-100 w-100" @click="sendMessage">
                    <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defTextVector['@state']]}`]" style="top: 0.25rem; left: 0.5rem;" v-if="!showStatus"></i>
                    Apply
                </button>

            </div>

            <!-- *************************************************************************************************** -->

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-2 pb-1" v-if="defTextVector['@perm'] !== 'ro' && direction === 'col'">

            <button class="btn btn-sm btn-outline-primary h-100 w-100" @click="sendMessage">
                <i :class="['position-absolute', 'bi', 'bi-circle-fill', `text-${COLORS[defTextVector['@state']]}`]" style="top: 0.25rem; left: 0.5rem;" v-if="!showStatus"></i>
                Apply
            </button>

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
