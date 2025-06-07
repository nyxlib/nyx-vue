// noinspection JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import {createPinia} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import * as bootstrap from 'bootstrap';
import * as uuid      from 'uuid'     ;

import draggable from 'vuedraggable';
import flatpickr from 'flatpickr';
import chartjs from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/

import * as d3              from 'd3'               ;
import * as d3GeoProjection from 'd3-geo-projection';

/*--------------------------------------------------------------------------------------------------------------------*/

import mqttPlugin from './plugins/mqtt';
import nssPlugin from './plugins/nss';
import nyxPlugin from './plugins/nyx';

import useNyxStore from './stores/nyx';

import Splitter from './components/ui/Splitter.vue';
import NavTabs from './components/ui/NavTabs.vue';
import TabPane from './components/ui/TabPane.vue';

import NyxDevices from './components/NyxDevices.vue';
import NyxTopology from './components/NyxTopology.vue';
import NyxVariables from './components/NyxVariables.vue';
import NyxDashboard from './components/NyxDashboard.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app, pinia = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__NYX_BOOTSTRAP__ = bootstrap;
    window.__NYX_DRAGGABLE__ = draggable;
	window.__NYX_FLATPICKR__ = flatpickr;
    window.__NYX_CHARTJS__ = chartjs;
    window.__NYX_UUID__ = uuid;

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__NYX_D3__                = d3             ;
    window.__NYX_D3_GEO_PROJECTION__ = d3GeoProjection;

    /*----------------------------------------------------------------------------------------------------------------*/

    if(!pinia)
    {
        app.use(createPinia());
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    app.use(mqttPlugin);
    app.use(nssPlugin);
    app.use(nyxPlugin);

    /*----------------------------------------------------------------------------------------------------------------*/

    app.component('Splitter', Splitter);
    app.component('NavTabs', NavTabs);
    app.component('TabPane', TabPane);

    app.component('NyxDevices', NyxDevices);
    app.component('NyxTopology', NyxTopology);
    app.component('NyxVariables', NyxVariables);
    app.component('NyxDashboard', NyxDashboard);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useNyxStore,
};

/*--------------------------------------------------------------------------------------------------------------------*/
