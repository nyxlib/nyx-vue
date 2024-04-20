<!--suppress JSUnresolvedReference -->
<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, provide, onMounted} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    margin: {
        type: String,
        default: 'mb-4',
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const tabs = ref([]);

const ulRef = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

provide('addTab', (tabId, tabName, tabIcon, onShow, onShown, onHide, onHidden) => {

    tabs.value.push({
        tabId: tabId,
        tabName: tabName,
        tabIcon: tabIcon,
        onShow: onShow,
        onShown: onShown,
        onHide: onHide,
        onHidden: onHidden,
    });

   return tabs.value.length === 1;
});

/*--------------------------------------------------------------------------------------------------------------------*/
/* INITIALIZATION                                                                                                     */
/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    setTimeout(() => {

        tabs.value.forEach((tab) => {

            const el = ulRef.value.querySelector(`button[data-bs-target="#${tab.tabId}"]`);

            if(el)
            {
                el.addEventListener('show.bs.tab', tab.onShow);

                el.addEventListener('shown.bs.tab', tab.onShown);

                el.addEventListener('hide.bs.tab', tab.onHide);

                el.addEventListener('hidden.bs.tab', tab.onHidden);
            }
        });

    }, 500);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->
    <!-- NAV TABS                                                                                                    -->
    <!-- *********************************************************************************************************** -->

    <ul :class="['nav', 'nav-tabs', margin]" role="tablist" ref="ulRef">

        <li class="nav-item" role="presentation" v-for="(tab, idx) in tabs" :key="idx">

            <button :class="['nav-link', 'px-3', 'py-2', {'active': idx === 0}]" type="button" data-bs-toggle="tab" :data-bs-target="`#${tab.tabId}`" role="tab">

                <i :class="['bi', `bi-${tab.tabIcon}`]" v-if="tab.tabIcon"></i>

                {{ tab.tabName }}

            </button>

        </li>

    </ul>

    <!-- *********************************************************************************************************** -->
    <!-- TABS CONTENT                                                                                                -->
    <!-- *********************************************************************************************************** -->

    <div class="tab-content flex-grow-1">

        <slot></slot>

    </div>

    <!-- *********************************************************************************************************** -->

</template>
