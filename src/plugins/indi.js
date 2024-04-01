/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _buildKey = (message) => `${message['@device']}:${message['@name']}`;

/*--------------------------------------------------------------------------------------------------------------------*/

const _processMessage_func = (message) => {

    const indiStore = useIndiStore();

    if('<>' in message)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* DEF* VECTORS                                                                                               */
        /*------------------------------------------------------------------------------------------------------------*/

        /**/ if(message['<>'].startsWith('def') && '@device' in message && '@name' in message && 'children' in message)
        {
            indiStore.defXXXVectorDict[_buildKey(message)] = message;

            message['children'].forEach((defXXX) => {

                if('@format' in defXXX)
                {
                    const m = /%\d*(?:\.(\d+))?f/.exec(defXXX['@format'].toString());

                    defXXX['$'] = (m && typeof m[1] !== 'undefined') ? defXXX['$']
                                                                            = parseFloat(defXXX['$'].toString()).toFixed(parseInt(m[1])).toString()
                                                                     : defXXX['$']
                    ;
                }

                defXXX['@orig'] = defXXX['$'];
            });
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* SET* VECTORS                                                                                               */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'].startsWith('set') && '@device' in message && '@name' in message && 'children' in message)
        {
            const vector = indiStore.defXXXVectorDict[_buildKey(message)];

            if(!vector)
            {
                return;
            }

            const children1 = message['children'];
            const children2 = vector['children'];

            for(let i = 0, j = Math.min(children1.length, children2.length); i < j; i++)
            {
                if('$' in children1[i] && children2[i]['$'] !== children1[i]['$'])
                {
                    children2[i]['@orig'] = children1[i]['$'];

                    children2[i]['$'] = children1[i]['$'];
                }
            }

            if(('@state' in message) && vector['@state'] !== message['@state'])
            {
                vector['@state'] = message['@state'];
            }

            if(('@perm' in message) && vector['@perm'] !== message['@perm'])
            {
                vector['@perm'] = message['@perm'];
            }
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* DEL* VECTORS                                                                                               */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'delProperty' && '@device' in message && '@name' in message)
        {
            delete indiStore.defXXXVectorDict[_buildKey(message)];
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* DRIVERS                                                                                                    */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'drivers' && 'driver_list' in message)
        {
            indiStore.driverDefs = message['driver_list'].map(driver => ({
                value: `indi_${driver}`,
                label: driver
            }));
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* MESSAGES                                                                                                   */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'message')
        {
            let list;

            if(message['@device'] in indiStore.messageDict)
            {
                list = indiStore.messageDict[message['@device']] ; //;
            }
            else
            {
                list = indiStore.messageDict[message['@device']] = [];
            }

            list.unshift({
                timestamp: message['@timestamp'] || '',
                message  : message['@message'  ] || '',
            });

            indiStore.updateTerminal();
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildNewTextVectorMessage_func = (defTextVector) => {

    const result = {'<>': 'newTextVector', '@device': defTextVector['@device'], '@name': defTextVector['@name'], 'children': []};

    defTextVector['children'].forEach((defText) => {

        if(defText['@orig'].toString() !== defText['$'].toString())
        {
            result['children'].push({
                '<>': 'oneText',
                '@name': defText['@name'],
                '$': defText['$'].toString(),
            });
        }
    });

    return result['children'].length > 0 ? JSON.stringify(result) : null;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildNewNumberVectorMessage_func = (defNumberVector) => {

    const result = {'<>': 'newNumberVector', '@device': defNumberVector['@device'], '@name': defNumberVector['@name'], 'children': []};

    defNumberVector['children'].forEach((defNumber) => {

        if(defNumber['@orig'].toString() !== defNumber['$'].toString())
        {
            result['children'].push({
                '<>': 'oneNumber',
                '@name': defNumber['@name'],
                '$': defNumber['$'].toString(),
            });
        }
    });

    return result['children'].length > 0 ? JSON.stringify(result) : null;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildNewSwitchVectorMessage_func = (defSwitchVector, index) => {

    const result = {'<>': 'newSwitchVector', '@device': defSwitchVector['@device'], '@name': defSwitchVector['@name'], 'children': []};

    switch(defSwitchVector['@rule'])
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* OneOfMany                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'OneOfMany':

            defSwitchVector['children'].forEach((def, INDEX) => {

                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': index === INDEX ? 'On' : 'Off',
                });
            });

            break;

        /*------------------------------------------------------------------------------------------------------------*/
        /* AtMostOne                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'AtMostOne':

            defSwitchVector['children'].forEach((def, INDEX) => {

                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': index === INDEX ? (def['$'] === 'On' ? 'Off' : 'On') : 'Off',
                });
            });

            break;

        /*------------------------------------------------------------------------------------------------------------*/
        /* AnyOfMany                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'AnyOfMany':

            defSwitchVector['children'].forEach((def, INDEX) => {

                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': index === INDEX ? (def['$'] === 'On' ? 'Off' : 'On') : def['$'],
                });
            });

            break;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    return JSON.stringify(result);
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('indi', {
            processMessage: _processMessage_func,
            buildNewTextVectorMessage: _buildNewTextVectorMessage_func,
            buildNewNumberVectorMessage: _buildNewNumberVectorMessage_func,
            buildNewSwitchVectorMessage: _buildNewSwitchVectorMessage_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
