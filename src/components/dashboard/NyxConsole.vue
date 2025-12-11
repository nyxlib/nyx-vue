<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject} from 'vue';

import {Modal} from 'bootstrap';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const nyx = inject('nyx');

/*--------------------------------------------------------------------------------------------------------------------*/

const nyxStore = useNyxStore();

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    deviceName: {
        type: String,
        default: '',
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const consoleEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const show = () => {

    Modal.getOrCreateInstance(consoleEl.value).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const clear = () => {

    if(props.deviceName in nyxStore.messageDict)
    {
        nyxStore.messageDict[props.deviceName].length = 0;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- BUTTON                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <button class="btn btn-xs btn-secondary" type="button" @click="show">
        <i class="bi bi-card-text"></i>
        logs
        <span class="badge rounded-pill bg-danger">
            {{ nyxStore.numberOfMessages(props.deviceName) }}
        </span>
    </button>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" ref="consoleEl">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <!-- ******************************************************************************************* -->

                    <div class="modal-header px-3 py-2">

                        <h5 class="modal-title">
                            <i class="bi bi-card-text"></i>
                            {{ props.deviceName }}
                            [
                            <button class="btn btn-xs btn-secondary" type="button" @click="clear">
                                <i class="bi bi-trash"></i>
                                clear
                                <span class="badge rounded-pill bg-danger">
                                    {{ nyxStore.numberOfMessages(props.deviceName) }}
                                </span>
                            </button>
                            ]
                        </h5>

                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>

                    </div>

                    <!-- ******************************************************************************************* -->

                    <div class="modal-body text-light bg-dark px-3 py-2">

                        <pre class="font-monospace overflow-y-scroll" style="min-height: 30vh; max-height: 80vh;"><code v-for="entry in nyxStore.messageDict[props.deviceName]" :key="entry">{{ `${entry.timestamp}: ${entry.message.trim()}\n` }}</code></pre>

                    </div>

                    <!-- ******************************************************************************************* -->

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>
