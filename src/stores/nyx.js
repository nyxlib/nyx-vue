/*--------------------------------------------------------------------------------------------------------------------*/

import {defineStore} from 'pinia';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const CATEGORY_DEFS = [
    {value: 'weather', label: 'Weather'},
    {value: 'dome', label: 'Dome'},
    {value: 'mount', label: 'Mount'},
    {value: 'imaging_camera', label: 'Imaging camera'},
    {value: 'guiding_camera', label: 'Guiding camera'},
    {value: 'field_rotator', label: 'Field rotator'},
    {value: 'filter_wheel', label: 'Filter wheel'},
    {value: 'focuser', label: 'Focuser'},
    {value: 'aux1', label: 'Aux 1'},
    {value: 'aux2', label: 'Aux 2'},
    {value: 'aux3', label: 'Aux 3'},
    {value: 'aux4', label: 'Aux 4'},
    {value: 'aux5', label: 'Aux 5'},
    {value: 'aux6', label: 'Aux 6'},
    {value: 'aux7', label: 'Aux 7'},
    {value: 'aux8', label: 'Aux 8'},
];

/*--------------------------------------------------------------------------------------------------------------------*/
/* STORE                                                                                                              */
/*--------------------------------------------------------------------------------------------------------------------*/

const useNyxStore = defineStore('nyx', {
    state: () => {

        /*------------------------------------------------------------------------------------------------------------*/

        return {
            clientId: '',
            isConnected: false,
            /**/
            messageDict: {},
            defXXXVectorDict: {},
            /**/
            nodePingDict: {},
            clientPingDict: {},
            specialPingDict: {},
        };

        /*------------------------------------------------------------------------------------------------------------*/
    },
    getters: {

        /*------------------------------------------------------------------------------------------------------------*/
        /* DEFS                                                                                                       */
        /*------------------------------------------------------------------------------------------------------------*/

        categoryDefs()
        {
            return CATEGORY_DEFS;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        deviceDefs()
        {
            return [...new Set(Object.values(this.defXXXVectorDict).map((defXXXVector) => defXXXVector['@device']))].map((name) => ({
                value: name,
                label: name,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        vectorDefs()
        {
            return [...new Set(Object.values(this.defXXXVectorDict).map((defXXXVector) => `${defXXXVector['@device']}:${defXXXVector['@name']}`))].map((name) => ({
                value: name,
                label: name,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        streamDefs()
        {
            return [...new Set(Object.values(this.defXXXVectorDict).filter((defXXXVector) => defXXXVector['<>'] === 'defStreamVector').map((defXXXVector) => `${defXXXVector['@device']}:${defXXXVector['@name']}`))].map((name) => ({
                value: name,
                label: name,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        variableDefs()
        {
            return Object.keys(this.variables).map((name) => ({
                value: name,
                label: name,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/

        blobDefs()
        {
            return Object.keys(this.blobs).map((name) => ({
                value: name,
                label: name,
            }));
        },

        /*------------------------------------------------------------------------------------------------------------*/
        /* VALUES                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        variables()
        {
            const result = {};

            Object.values(this.defXXXVectorDict).filter((defXXXVector) => defXXXVector['<>'] !== 'defBLOBVector' && defXXXVector['<>'] !== 'defStreamVector').forEach((defXXXVector) => defXXXVector['children'].forEach((defXXX) => {

                result[`${defXXXVector['@device']}:${defXXXVector['@name']}:${defXXX['@name']}`] = defXXX;
            }));

            return result;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        blobs()
        {
            const result = {};

            Object.values(this.defXXXVectorDict).filter((defXXXVector) => defXXXVector['<>'] === 'defBLOBVector').forEach((defXXXVector) => defXXXVector['children'].forEach((defXXX) => {

                result[`${defXXXVector['@device']}:${defXXXVector['@name']}:${defXXX['@name']}`] = defXXX;
            }));

            return result;
        },

        /*------------------------------------------------------------------------------------------------------------*/

        streams()
        {
            const result = {};

            Object.values(this.defXXXVectorDict).filter((defXXXVector) => defXXXVector['<>'] === 'defStreamVector').forEach((defXXXVector) => defXXXVector['children'].forEach((defXXX) => {

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
                const device = options.deviceDict[options.category]?.trim();

                if(device)
                {
                    const qualifiedName = `${device}:${variableName}`;

                    return options.startsWith ? Object.entries(this.variables).filter((x) => x[0].startsWith(qualifiedName)).map((x) => x[1])///
                                              : Object.entries(this.variables).filter((x) => x[0]    ===    (qualifiedName)).map((x) => x[1])[0]
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

            return undefined;
        },

        /*------------------------------------------------------------------------------------------------------------*/
        /* MESSAGES                                                                                                   */
        /*------------------------------------------------------------------------------------------------------------*/

        numberOfMessages(deviceName)
        {
            return this.messageDict[deviceName]?.length ?? 0;
        },

        /*------------------------------------------------------------------------------------------------------------*/
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

export default useNyxStore;

/*--------------------------------------------------------------------------------------------------------------------*/
