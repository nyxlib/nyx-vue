/*--------------------------------------------------------------------------------------------------------------------*/

import {createPinia} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/

import * as popperJS from '@popperjs/core';
import * as bootstrap from 'bootstrap';
import draggable from 'vuedraggable';
import flatpickr from 'flatpickr';
import chartJS from 'chart.js/auto';
import Plotly from 'plotly.js-dist-min';
import {Graph3d} from 'vis-graph3d/peer';
import {DataSet} from 'vis-data/peer';
import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import * as d3 from 'd3';
import * as d3Zoom from 'd3-zoom';
import * as d3Selection from 'd3-selection';
import * as d3GeoProjection from 'd3-geo-projection';

/*--------------------------------------------------------------------------------------------------------------------*/

import mqttPlugin from './plugins/mqtt';
import nssPlugin from './plugins/nss';
import nyxPlugin from './plugins/nyx';

import useNyxStore from './stores/nyx';

import DateTime from './components/ui/DateTime.vue';
import Splitter from './components/ui/Splitter.vue';
import NavTabs from './components/ui/NavTabs.vue';
import TabPane from './components/ui/TabPane.vue';
import InputRange from './components/ui/InputRange.vue';
import Sexagesimal from './components/ui/Sexagesimal.vue';
import Gauge from './components/ui/Gauge.vue';

import NyxTopology from './components/NyxTopology.vue';
import NyxVariables from './components/NyxVariables.vue';
import NyxDashboard from './components/NyxDashboard.vue';
import NyxDevices from './components/NyxDevices.vue';

import NyxGroup from './components/dashboard/NyxGroup.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

const setup = (app, pinia = null) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__NYX_POPPERJS__ = /* NOSONAR */ popperJS;
    window.__NYX_BOOTSTRAP__ = /* NOSONAR */ bootstrap;
    window.__NYX_DRAGGABLE__ = /* NOSONAR */ draggable;
	window.__NYX_FLATPICKR__ = /* NOSONAR */ flatpickr;
    window.__NYX_CHARTJS__ = /* NOSONAR */ chartJS;
    window.__NYX_CHARTJS__ = /* NOSONAR */ Plotly;
    window.__NYX_UUID__ = /* NOSONAR */ uuid;

    /*----------------------------------------------------------------------------------------------------------------*/

    window.__NYX_D3__                = /* NOSONAR */ d3             ;
    window.__NYX_D3_ZOOM__           = /* NOSONAR */ d3Zoom         ;
    window.__NYX_D3_SELECTION__      = /* NOSONAR */ d3Selection    ;
    window.__NYX_D3_GEO_PROJECTION__ = /* NOSONAR */ d3GeoProjection;

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

    app.component('DateTime', DateTime);
    app.component('Splitter', Splitter);
    app.component('NavTabs', NavTabs);
    app.component('TabPane', TabPane);
    app.component('InputRange', InputRange);
    app.component('Sexagesimal', Sexagesimal);
    app.component('Gauge', Gauge);

    /*----------------------------------------------------------------------------------------------------------------*/

    app.component('NyxTopology', NyxTopology);
    app.component('NyxVariables', NyxVariables);
    app.component('NyxDashboard', NyxDashboard);
    app.component('NyxDevices', NyxDevices);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export {
    setup,
    /* NOSONAR */ useNyxStore,
    /* NOSONAR */ NyxGroup,
};

/*--------------------------------------------------------------------------------------------------------------------*/
