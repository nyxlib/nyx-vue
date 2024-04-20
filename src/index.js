/*--------------------------------------------------------------------------------------------------------------------*/

import 'bootstrap/js/src/tab';
import 'bootstrap/js/src/modal';

import 'chartjs-adapter-date-fns';

/*--------------------------------------------------------------------------------------------------------------------*/

import indiPlugin from './plugins/indi';
import mqttPlugin from './plugins/mqtt';

import useIndiStore from './stores/indi';

import IndiDevices from './components/IndiDevices.vue';
import IndiVariables from './components/IndiVariables.vue';
import IndiDashboard from './components/IndiDashboard.vue';
import IndiMonitoring from './components/IndiMonitoring.vue'

import NavTabs from './components/controls/NavTabs.vue';
import TabPane from './components/controls/TabPane.vue'

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app) => {

    app.use(indiPlugin);
    app.use(mqttPlugin);
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useIndiStore,
    IndiDevices,
    IndiVariables,
    IndiDashboard,
    IndiMonitoring,
    NavTabs,
    TabPane,
};

/*--------------------------------------------------------------------------------------------------------------------*/
