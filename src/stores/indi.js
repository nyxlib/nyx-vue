// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import { defineStore } from 'pinia';

import { Terminal } from 'xterm';

import 'xterm/css/xterm.css';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const CATEGORY_DEFS = [
    {value: 'weather', label: 'Weather'},
    {value: 'dome', label: 'Dome'},
    {value: 'mount', label: 'Mount'},
    {value: 'imaging_camera1', label: 'Imaging camera 1'},
    {value: 'guiding_camera1', label: 'Guiding camera 1'},
    {value: 'focuser1', label: 'Focuser 1'},
    {value: 'filters1', label: 'Filters 1'},
    {value: 'imaging_camera2', label: 'Imaging camera 2'},
    {value: 'guiding_camera2', label: 'Guiding camera 2'},
    {value: 'focuser2', label: 'Focuser 2'},
    {value: 'filters2', label: 'Filters 2'},
    {value: 'imaging_camera3', label: 'Imaging camera 3'},
    {value: 'guiding_camera3', label: 'Guiding camera 3'},
    {value: 'focuser3', label: 'Focuser 3'},
    {value: 'filters3', label: 'Filters 3'},
];

/*--------------------------------------------------------------------------------------------------------------------*/

const TERMINAL = new Terminal({convertEol: true, fontFamily: 'Ubuntu Mono, courier-new, courier, monospace'});

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useIndiStore = defineStore('indi', {
    state: () => {

        /*------------------------------------------------------------------------------------------------------------*/

        return {
            currentDeviceName: '---',
            /**/
            driverDefs: [],
            driverDict: {},
            deviceDict: {},
            messageDict: {},
            defXXXVectorDict: {},
        };

        /*------------------------------------------------------------------------------------------------------------*/
    },
    getters: {

        /*------------------------------------------------------------------------------------------------------------*/

        isOn()
        {
            return Object.keys(this.   driverDict   ).length > 0
                   &&
                   Object.keys(this.defXXXVectorDict).length > 0
            ;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        drivers()
        {
            return Object.values(this.driverDict).map(x => x.driver);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        categoryDefs()
        {
            return CATEGORY_DEFS;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        deviceDefs()
        {
            return [...new Set(Object.values(this.defXXXVectorDict).map(x => x['@device']))].map(device => ({
                value: device,
                label: device,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        variables()
        {
            const result = {};

            Object.values(this.defXXXVectorDict).forEach((defXXXVector) => defXXXVector['children'].forEach((defXXX) => {

                result[`${defXXXVector['@device']}:${defXXXVector['@name']}:${defXXX['@name']}`] = defXXX;
            }));

            return result;
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
    actions: {
        /*------------------------------------------------------------------------------------------------------------*/

        setup(div)
        {
            TERMINAL.open(div);
        },

        /*------------------------------------------------------------------------------------------------------------*/

        resolve(category, variableName, startsWith = false)
        {
            const names = Object.values(this.deviceDict).filter((device) => device.category === category).map((device) => `${device.device}:${variableName}`);

            if(names.length > 0)
            {
                return startsWith ? Object.entries(this.variables).filter((variable) => variable[0].startsWith(names[0])).map((variable) => variable[1])///
                                  : Object.entries(this.variables).filter((variable) => variable[0]    ===    (names[0])).map((variable) => variable[1])[0]
                ;
            }

            return startsWith ? [  ]
                              : null
            ;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        clearTerminal()
        {
            TERMINAL.clear();

            this.messageDict[this.currentDeviceName].length = 0;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        updateTerminal(newDeviceName = null)
        {
            TERMINAL.clear();

            if(newDeviceName)
            {
                this.currentDeviceName = newDeviceName;
            }

            if(this.currentDeviceName in this.messageDict)
            {
                this.messageDict[this.currentDeviceName].map((x) => `${x.timestamp} - ${x.message}`).forEach((line) => TERMINAL.writeln(line));
            }
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useIndiStore;

/*--------------------------------------------------------------------------------------------------------------------*/
