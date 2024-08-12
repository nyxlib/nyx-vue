// noinspection JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import {defineStore} from 'pinia';

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
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useNyxStore = defineStore('nyx', {
    state: () => {

        /*------------------------------------------------------------------------------------------------------------*/

        return {
            isConnected: false,
            curDeviceName: '---',
            /**/
            messageDict: {},
            defXXXVectorDict: {},
            /**/
            nodePingDict: {},
            clientPingDict: {},
        };

        /*------------------------------------------------------------------------------------------------------------*/
    },
    getters: {

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
        /* VARIABLES                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        resolve(variableName, options = null)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            if(typeof options !== 'object' || options === null)
            {
                options = {};
            }

            if(typeof options.deviceDict !== 'object' || options.deviceDict === null)
            {
                options.deviceDict = {};
            }

            /*--------------------------------------------------------------------------------------------------------*/

            if(options.category)
            {
                const composedName = Object.values(options.deviceDict).filter((x) => x.category === options.category).map((x) => `${x.device}:${variableName}`)[0];

                if(composedName)
                {
                    return options.startsWith ? Object.entries(this.variables).filter((x) => x[0].startsWith(composedName)).map((x) => x[1])///
                                              : Object.entries(this.variables).filter((x) => x[0]    ===    (composedName)).map((x) => x[1])[0]
                    ;
                }
            }
            else
            {
                return options.startsWith ? Object.entries(this.variables).filter((x) => x[0].startsWith(variableName)).map((x) => x[1])///
                                          : Object.entries(this.variables).filter((x) => x[0]    ===    (variableName)).map((x) => x[1])[0]
                ;

            }

            /*--------------------------------------------------------------------------------------------------------*/

            return null;
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

export default useNyxStore;

/*--------------------------------------------------------------------------------------------------------------------*/
