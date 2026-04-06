<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, nextTick, onMounted, onBeforeUnmount} from 'vue';

import Split from 'split.js';

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    sizes: {
        type: Array,
        default: () => [
            25,
            75,
        ],
    },
    direction: {
        type: String,
        default: 'horizontal',
        validator: (x) => ['horizontal', 'vertical', 'none'].includes(x),
    },
    gutterSize: {
        type: Number,
        default: 3,
    },
    leftId: {
        type: String,
        default: () => `nyx_split_left_${uuid.v4()}`,
    },
    rightId: {
        type: String,
        default: () => `nyx_tab_right_${uuid.v4()}`,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits([
    'resize'
]);

/*--------------------------------------------------------------------------------------------------------------------*/

const currDirection = ref('none');

/*--------------------------------------------------------------------------------------------------------------------*/

let splitterInstance = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const destroySplitter = () => {

    splitterInstance?.destroy();
};

/*--------------------------------------------------------------------------------------------------------------------*/

const updateSplitter = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    let direction = (props.direction === 'horizontal') ? (window.innerWidth >= 768 ? 'horizontal' : 'none')
                                                       : props.direction
    ;

    /*----------------------------------------------------------------------------------------------------------------*/

    if(currDirection.value !== direction)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        destroySplitter();

        /*------------------------------------------------------------------------------------------------------------*/

        currDirection.value = direction;

        /*------------------------------------------------------------------------------------------------------------*/

        if(direction !== 'none')
        {
            nextTick(() => {

                splitterInstance = Split([
                    `#${props.leftId}`,
                    `#${props.rightId}`,
                ], {
                    sizes: props.sizes,
                    direction: direction,
                    gutterSize: props.gutterSize,
                    onDragEnd: () => {

                        emit('resize', splitterInstance.getSizes());
                    },
                });

                emit('resize', splitterInstance.getSizes());
            });
        }
        else
        {
            emit('resize', [50, 50]);
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }
    else
    {
        if(splitterInstance)
        {
            emit('resize', splitterInstance.getSizes());
        }
        else
        {
            emit('resize', [50, 50]);
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(async () => {

    window.addEventListener('resize', updateSplitter);

    updateSplitter();
});

/*--------------------------------------------------------------------------------------------------------------------*/

onBeforeUnmount(() => {

    window.removeEventListener('resize', updateSplitter);

    destroySplitter();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <div :class="currDirection !== 'none' ? ['d-flex', currDirection !== 'horizontal' ? 'flex-column' : 'flex-row', 'h-100', 'w-100'] : ['overflow-x-hidden', 'overflow-y-auto', 'h-100', 'w-100']">

        <div :class="currDirection !== 'none' ? ['overflow-x-hidden', 'overflow-y-auto', 'h-100'] : []" :id="leftId">
            <slot name="left"></slot>
        </div>

        <div :class="currDirection !== 'none' ? ['overflow-x-hidden', 'overflow-y-auto', 'h-100'] : []" :id="rightId">
            <slot name="right"></slot>
        </div>

    </div>

    <!-- *********************************************************************************************************** -->

</template>

<style>
/*--------------------------------------------------------------------------------------------------------------------*/

.gutter {
    background-color: rgba(var(--bs-body-color-rgb), 0.03);
    background-repeat: no-repeat;
    background-position: 50%;
}

/*--------------------------------------------------------------------------------------------------------------------*/

.gutter.gutter-horizontal {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: col-resize;
}

.gutter.gutter-vertical {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
    cursor: row-resize;
}

/*--------------------------------------------------------------------------------------------------------------------*/
</style>
