// noinspection JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import {createPinia} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import * as Bootstrap from 'bootstrap';

import flatpickr from 'flatpickr';

import ChartJS from 'chart.js/auto';

import * as uuid from 'uuid';

import * as d3 from 'd3';

import * as d3GeoProjection from 'd3-geo-projection';

/*--------------------------------------------------------------------------------------------------------------------*/

import nyxPlugin from './plugins/nyx';
import mqttPlugin from './plugins/mqtt';

import useNyxStore from './stores/nyx';

import Splitter from './components/ui/Splitter.vue';
import NavTabs from './components/ui/NavTabs.vue';
import TabPane from './components/ui/TabPane.vue';

import NyxDevices from './components/NyxDevices.vue';
import NyxTopology from './components/NyxTopology.vue';
import NyxVariables from './components/NyxVariables.vue';
import NyxDashboard from './components/NyxDashboard.vue';
import NyxMonitoring from './components/NyxMonitoring.vue'

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app, pinia = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__NYX_BOOTSTRAP__ = Bootstrap;
	window.__NYX_FLATPICKR__ = flatpickr;
    window.__NYX_CHARTJS__ = ChartJS;
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
    app.use(nyxPlugin);

    /*----------------------------------------------------------------------------------------------------------------*/

    app.component('Splitter', Splitter);
    app.component('NavTabs', NavTabs);
    app.component('TabPane', TabPane);

    app.component('NyxDevices', NyxDevices);
    app.component('NyxTopology', NyxTopology);
    app.component('NyxVariables', NyxVariables);
    app.component('NyxDashboard', NyxDashboard);
    app.component('NyxMonitoring', NyxMonitoring);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useNyxStore,
};

/*--------------------------------------------------------------------------------------------------------------------*/
