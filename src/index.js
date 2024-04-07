/*--------------------------------------------------------------------------------------------------------------------*/

import 'bootstrap/js/src/tab';
import 'bootstrap/js/src/modal';

/*--------------------------------------------------------------------------------------------------------------------*/

import indiPlugin from './plugins/indi';
import mqttPlugin from './plugins/mqtt';

import useIndiStore from './stores/indi';

import IndiVariables from './components/IndiVariables.vue';
import IndiDashboard from './components/IndiDashboard.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app) => {

    const indiStore = useIndiStore();

    app.use(indiPlugin, {indiStore: indiStore});
    app.use(mqttPlugin, {indiStore: indiStore});
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    useIndiStore,
    IndiVariables,
    IndiDashboard,
};

/*--------------------------------------------------------------------------------------------------------------------*/
