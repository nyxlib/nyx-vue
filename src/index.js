// noinspection JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import * as Bootstrap from 'bootstrap/dist/js/bootstrap.esm';

import ChartJS from 'chart.js/auto';

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

const setup = (app) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__BOOTSTRAP__ = Bootstrap;
    window.__CHARTJS__ = ChartJS;

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
