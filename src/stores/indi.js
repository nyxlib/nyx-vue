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

const useIndiStore = defineStore('indi', {
    state: () => {

        /*------------------------------------------------------------------------------------------------------------*/

        return {
            isConnected: false,
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
