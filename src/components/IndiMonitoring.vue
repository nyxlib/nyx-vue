<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import { inject, onMounted } from 'vue';

import { Modal, Tooltip } from 'bootstrap';

import { GridStack } from 'gridstack';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const indi = inject('indi');

/*--------------------------------------------------------------------------------------------------------------------*/

let grid = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const newWidget = () => {

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).show();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const addWidget = () => {

    grid.addWidget({w: 2, content: 'item'});

    Modal.getOrCreateInstance(document.getElementById('indi_metrics')).hide();
};

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    new Tooltip(document.body, {
        selector: '[data-bs-title]'
    });

    grid = GridStack.init({
        removable: '#AAE7F472'
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- DASHBOARD                                                                                                   -->
    <!-- *********************************************************************************************************** -->

    <div class="grid-stack h-100 w-100"></div>

    <!-- *********************************************************************************************************** -->

    <div class="position-absolute" style="right: 1rem; bottom: 1rem;">

        <button class="btn btn-primary ms-0" type="button" data-bs-placement="top" data-bs-title="Add a new widget" @click="newWidget">
            <i class="bi bi-plus-lg"></i>
        </button>

        <button class="btn btn-danger ms-1" type="button" data-bs-placement="top" data-bs-title="Drop here to remove" id="AAE7F472">
            <i class="bi bi-trash2"></i>
        </button>

    </div>

    <!-- *********************************************************************************************************** -->
    <!-- MODAL                                                                                                       -->
    <!-- *********************************************************************************************************** -->

    <teleport to="body">

        <div class="modal" tabindex="-1" id="indi_metrics">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">

                    <div class="modal-header px-3 py-2">
                        <h5 class="modal-title">
                            <i class="bi bi-plus-lg"></i>
                            Add a metric
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body px-3 py-2">

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="D05CFEFF" class="form-label">Plot type</label>
                                    <select class="form-select form-select-sm" id="D05CFEFF">
                                        <option value="line">Line</option>
                                        <option value="scatter">Scatter</option>
                                        <option value="doughnut">Doughnut</option>
                                        <option value="radar">Radar</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="C8C721F4" class="form-label">Group<sup class="text-secondary">opt</sup></label>
                                    <input class="form-control form-control-sm" type="text" id="C8C721F4" placeholder="Group" />
                                </div>
                            </div>
                        </div>



                    </div>

                    <div class="modal-footer px-3 py-1">

                        <button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
                            Cancel
                        </button>

                        <button class="btn btn-primary" type="button" @click="addWidget">
                            <i class="bi bi-plus-ls">Add</i>
                        </button>

                    </div>

                </div>
            </div>
        </div>

    </teleport>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

@import "gridstack/dist/gridstack.css";

/*--------------------------------------------------------------------------------------------------------------------*/

.grid-stack > .grid-stack-item > .grid-stack-item-content {

    background-color: rgba(0, 0, 0, 2.5%) !important;
}

[data-bs-theme=dark] .grid-stack > .grid-stack-item > .grid-stack-item-content {

    background-color: rgba(255, 255, 255, 10%) !important;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
