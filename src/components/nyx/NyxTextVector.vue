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
    defTextVector: {
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
        new Popover(popoverRef.value, {
            html: true,
            trigger: 'focus hover',
            content: marked.parse(props.defTextVector['@hints'])
        });
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div class="row mx-0 w-100">

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-3">

            <i :class="['bi', 'bi-circle-fill', `text-${COLORS[defTextVector['@state']]}`]"></i>

            <span class="ms-1" tabindex="0" ref="popoverRef">{{ defTextVector['@label'] || defTextVector['@name'] }}</span>

        </div>

        <!-- ******************************************************************************************************* -->

        <div :class="{'col-lg-9': defTextVector['@perm'] === 'ro', 'col-lg-7': defTextVector['@perm'] !== 'ro'}">

            <template v-for="defText in defTextVector['children']" :key="defText">

                <div class="input-group input-group-sm mb-1">

                    <span class="input-group-text" style="min-width: 175px;">
                        {{ defText['@label'] || defText['@name'] }}
                    </span>

                    <input class="form-control" type="text" :readonly="defTextVector['@perm'] === 'ro'" v-model="defText['$']" />

                </div>

            </template>

        </div>

        <!-- ******************************************************************************************************* -->

        <div class="col-lg-2 mb-1" v-if="defTextVector['@perm'] !== 'ro'">

            <button class="btn btn-xs btn-outline-primary h-100 w-100" @click="sendMessage">
                Apply
            </button>

        </div>

        <!-- ******************************************************************************************************* -->

    </div>

    <!-- *********************************************************************************************************** -->

</template>
