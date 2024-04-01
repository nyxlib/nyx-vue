// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import { defineStore } from 'pinia';

import { Terminal } from 'xterm';

import 'xterm/css/xterm.css';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
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
            deviceDict: {},
            messageDict: {},
            defXXXVectorDict: {},
        };

        /*------------------------------------------------------------------------------------------------------------*/
    },
    getters: {

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
