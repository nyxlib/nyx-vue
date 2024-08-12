// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as uuid from 'uuid';

import {Terminal} from '@xterm/xterm';

import {WebLinksAddon} from '@xterm/addon-web-links';

/*--------------------------------------------------------------------------------------------------------------------*/

import useIndiStore from '../stores/indi';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const TERMINAL = new Terminal({
    rows: 28,
    cols: 85,
    convertEol: true,
    fontFamily: 'Ubuntu Mono, courier-new, courier, monospace'
});

/*--------------------------------------------------------------------------------------------------------------------*/

TERMINAL.loadAddon(new WebLinksAddon());

/*--------------------------------------------------------------------------------------------------------------------*/

let timer = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _init_func = (mqtt) => {

    /*----------------------------------------------------------------------------------------------------------------*/
    /* SETUP PING MECHANISM                                                                                           */
    /*----------------------------------------------------------------------------------------------------------------*/

    if(!timer)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        let clientId = localStorage.getItem('indi-client-id');

        /*------------------------------------------------------------------------------------------------------------*/

        if(!clientId)
        {
            clientId = uuid.v4().substring(0, 4).toUpperCase();

            localStorage.setItem('indi-client-id', clientId);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        let clientIP = null;

        fetch('https://api.ipify.org?format=json').then(response => response.json())

            /*--------------------------------------------------------------------------------------------------------*/

            .then((data) => {

                clientIP = `${data.ip}-${clientId}`;
            })

            .catch(() => {

                clientIP = `NOIP-${clientId}`;
            })

            /*--------------------------------------------------------------------------------------------------------*/

            .finally(() => {

                timer = setInterval(() => mqtt.emit('nyx/ping/client', clientIP), 5 * 1000);
            })

            /*--------------------------------------------------------------------------------------------------------*/
        ;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* SETUP MESSAGE MECHANISM                                                                                        */
    /*----------------------------------------------------------------------------------------------------------------*/

    const _getProperties = (connected) => {

        if(connected)
        {
            mqtt.subscribe('nyx/json');
            mqtt.subscribe('nyx/ping/node');
            mqtt.subscribe('nyx/ping/client');

            mqtt.emit('nyx/cmd/json', '{"<>": "getProperties", "@version": "1.7"}');
        }
    };

    mqtt.setConnectionCallback(_getProperties);

    _getProperties(mqtt.connected());

    /*----------------------------------------------------------------------------------------------------------------*/

    mqtt.setMessageCallback((topic, payload) => {

        try
        {
            /**/ if(topic === 'nyx/json')
            {
                _processMessage(JSON.parse(payload));
            }
            else if(topic === 'nyx/ping/node')
            {
                _processPing(payload, true);
            }
            else if(topic === 'nyx/ping/client')
            {
                _processPing(payload, false);
            }
        }
        catch(e)
        {
            console.error(`Error parsing message: ${e}`);
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _final_func = (mqtt) => {

    mqtt.setConnectionCallback(null);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _processPing = (message, isNode) => {

    const indiStore = useIndiStore(window.pinia);

    if(isNode)
    {
        indiStore.nodePingDict[message] = Date.now();
    }
    else
    {
        indiStore.clientPingDict[message] = Date.now();
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildKey = (message) => `${message['@device']}:${message['@name']}`;

/*--------------------------------------------------------------------------------------------------------------------*/

const _processMessage = (message) => {

    const indiStore = useIndiStore(window.pinia);

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
                message: message['@message'] || '',
            });

            _updateTerminal_func();
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

const _setupTerminal_func = (div, newDeviceName) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    TERMINAL.open(div);

    /*----------------------------------------------------------------------------------------------------------------*/

    useIndiStore(window.pinia).curDeviceName = newDeviceName;

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _clearTerminal_func = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    TERMINAL.clear();

    /*----------------------------------------------------------------------------------------------------------------*/

    const indiStore = useIndiStore(window.pinia);

    if(indiStore.curDeviceName in indiStore.messageDict)
    {
        indiStore.messageDict[indiStore.curDeviceName].length = 0;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _updateTerminal_func = () => {

    /*----------------------------------------------------------------------------------------------------------------*/

    TERMINAL.clear();

    /*----------------------------------------------------------------------------------------------------------------*/

    const indiStore = useIndiStore(window.pinia);

    if(indiStore.curDeviceName in indiStore.messageDict)
    {
        indiStore.messageDict[indiStore.curDeviceName].map((x) => `${x.timestamp.replace('T', ' ')} - ${x.message}`).forEach((line) => TERMINAL.writeln(line));
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('indi', {
            /* INITIALISATION */
            init: _init_func,
            final: _final_func,
            /* MESSAGES */
            buildNewTextVectorMessage: _buildNewTextVectorMessage_func,
            buildNewNumberVectorMessage: _buildNewNumberVectorMessage_func,
            buildNewSwitchVectorMessage: _buildNewSwitchVectorMessage_func,
            /* TERMINAL */
            setupTerminal: _setupTerminal_func,
            clearTerminal: _clearTerminal_func,
            updateTerminal: _updateTerminal_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
