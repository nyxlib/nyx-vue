/*--------------------------------------------------------------------------------------------------------------------*/

import 'bootstrap/js/src/tab';
import 'bootstrap/js/src/modal';

import 'chartjs-adapter-date-fns';

/*--------------------------------------------------------------------------------------------------------------------*/

import indiPlugin from './plugins/indi';
import mqttPlugin from './plugins/mqtt';

import useIndiStore from './stores/indi';

import IndiVariables from './components/IndiVariables.vue';
import IndiDashboard from './components/IndiDashboard.vue';
import IndiMonitoring from './components/IndiMonitoring.vue'

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app) => {

    app.use(indiPlugin);
    app.use(mqttPlugin);
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useIndiStore,
    IndiVariables,
    IndiDashboard,
    IndiMonitoring,
};

/*--------------------------------------------------------------------------------------------------------------------*/
