// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useIndiStore = defineStore('indi', {
    state: () => {

        /*------------------------------------------------------------------------------------------------------------*/

        return {
            isConnected: false,
            /**/
            curDeviceName: '---',
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
        /* VARIABLES                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        resolve(category, variableName, startsWith = false)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            if(category)
            {
                const names = Object.values(this.deviceDict).filter((device) => device.category === category).map((device) => `${device.device}:${variableName}`);

                if(names.length > 0)
                {
                    return startsWith ? Object.entries(this.variables).filter((variable) => variable[0].startsWith(names[0])).map((variable) => variable[1])///
                                      : Object.entries(this.variables).filter((variable) => variable[0]    ===    (names[0])).map((variable) => variable[1])[0]
                    ;
                }
            }

            /*--------------------------------------------------------------------------------------------------------*/

            return startsWith ? Object.entries(this.variables).filter((variable) => variable[0].startsWith(variableName)).map((variable) => variable[1])///
                              : Object.entries(this.variables).filter((variable) => variable[0]    ===    (variableName)).map((variable) => variable[1])[0]
            ;

            /*--------------------------------------------------------------------------------------------------------*/
        },

        /*------------------------------------------------------------------------------------------------------------*/
        /* MESSAGES                                                                                                   */
        /*------------------------------------------------------------------------------------------------------------*/

        numberOfMessages(deviceName)
        {
            return (deviceName in this.messageDict) ? this.messageDict[deviceName].length : 0;
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useIndiStore;

/*--------------------------------------------------------------------------------------------------------------------*/
