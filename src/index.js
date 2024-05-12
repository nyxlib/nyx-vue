/*--------------------------------------------------------------------------------------------------------------------*/

import 'bootstrap/dist/js/bootstrap.esm';

/*--------------------------------------------------------------------------------------------------------------------*/

import indiPlugin from './plugins/indi';
import mqttPlugin from './plugins/mqtt';

import useIndiStore from './stores/indi';

import IndiDevices from './components/IndiDevices.vue';
import IndiTopology from './components/IndiTopology.vue';
import IndiVariables from './components/IndiVariables.vue';
import IndiDashboard from './components/IndiDashboard.vue';
import IndiMonitoring from './components/IndiMonitoring.vue'

import NavTabs from './components/controls/NavTabs.vue';
import TabPane from './components/controls/TabPane.vue'

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app) => {

    app.use(mqttPlugin);
    app.use(indiPlugin);

    app.component('NavTabs', NavTabs);
    app.component('TabPane', TabPane);
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useIndiStore,
    IndiDevices,
    IndiTopology,
    IndiVariables,
    IndiDashboard,
    IndiMonitoring
};

/*--------------------------------------------------------------------------------------------------------------------*/
