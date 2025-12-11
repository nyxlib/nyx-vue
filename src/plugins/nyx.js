/*--------------------------------------------------------------------------------------------------------------------*/

import * as uuid from 'uuid';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let _timer = null;
let _mqtt = null;
let _nss = null;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _init_func = (mqtt, nss) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    _mqtt = mqtt;
    _nss = nss;

    /*----------------------------------------------------------------------------------------------------------------*/
    /* SETUP PING MECHANISM                                                                                           */
    /*----------------------------------------------------------------------------------------------------------------*/

    if(!_timer)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const nyxStore = useNyxStore();

        /*------------------------------------------------------------------------------------------------------------*/

        const clientId = localStorage.getItem('nyx-client-id') ?? (() => {

            const clientId = uuid.v4().substring(0, 4).toUpperCase();

            localStorage.setItem('nyx-client-id', clientId);

            return clientId;
        })();

        /*------------------------------------------------------------------------------------------------------------*/

        let clientIPId = null;

        fetch('https://api.ipify.org?format=json').then(response => response.json())

            /*--------------------------------------------------------------------------------------------------------*/

            .then((data) => {

                clientIPId = `${data.ip}-${clientId}`;
            })

            .catch(() => {

                clientIPId = `NOIP-${clientId}`;
            })

            /*--------------------------------------------------------------------------------------------------------*/

            .finally(() => {

                nyxStore.clientId = clientIPId;

                _timer = setInterval(() => _mqtt.emit('nyx/ping/client', clientIPId), 5 * 1000);
            })

            /*--------------------------------------------------------------------------------------------------------*/
        ;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* SETUP MESSAGE MECHANISM                                                                                        */
    /*----------------------------------------------------------------------------------------------------------------*/

    const _connectionCallback = (state) => {

        /**/ if(state === _mqtt.CONNECTED)
        {
            _mqtt.subscribe('nyx/json');
            _mqtt.subscribe('nyx/ping/node');
            _mqtt.subscribe('nyx/ping/client');
            _mqtt.subscribe('nyx/ping/special');

            _mqtt.emit('nyx/cmd/json', '{"<>": "getProperties", "@version": "1.7"}');
        }
        else if(state === _mqtt.DISCONNECTING)
        {
            _mqtt.emit('nyx/cmd/json', `{"<>": "enableBLOB", "@client": "${useNyxStore().clientId}", "$": "Never"}`);
            _mqtt.emit('nyx/cmd/json', `{"<>": "enableStream", "@client": "${useNyxStore().clientId}", "$": "Never"}`);
        }
    };

    _mqtt.setConnectionCallback(_connectionCallback);

    _connectionCallback(_mqtt.connected());

    /*----------------------------------------------------------------------------------------------------------------*/

    _mqtt.setMessageCallback((topic, payload) => {

        try
        {
            /**/ if(topic === 'nyx/json')
            {
                _processMessage(JSON.parse(payload));
            }
            else if(topic === 'nyx/ping/node')
            {
                useNyxStore().nodePingDict[payload] = Date.now();
            }
            else if(topic === 'nyx/ping/client')
            {
                useNyxStore().clientPingDict[payload] = Date.now();
            }
            else if(topic === 'nyx/ping/special')
            {
                useNyxStore().specialPingDict[payload] = Date.now();
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

const _final_func = () => {

    _mqtt.setConnectionCallback(null);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildKey = (message) => `${message['@device']}:${message['@name']}`;

/*--------------------------------------------------------------------------------------------------------------------*/

const _processMessage = (message) => {

    const nyxStore = useNyxStore();

    if('<>' in message)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* DEF STREAM VECTORS                                                                                         */
        /*------------------------------------------------------------------------------------------------------------*/

        if(message['<>'] === 'defStreamVector' && '@device' in message && '@name' in message && 'children' in message)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            nyxStore.defXXXVectorDict[_buildKey(message)] = message;

            /*--------------------------------------------------------------------------------------------------------*/

            const url = _nss.url() ? new URL(`streams/${message['@device']}/${message['@name']}`, _nss.url()).toString()
                                       : ''
            ;

            message['children'].forEach((defXXX) => {

                defXXX['$'] = `${url}#${defXXX['@hash']}`;
            });

            message['url'] = url;

            /*--------------------------------------------------------------------------------------------------------*/
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* DEF * VECTORS                                                                                              */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'].startsWith('def') && '@device' in message && '@name' in message && 'children' in message)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            nyxStore.defXXXVectorDict[_buildKey(message)] = message;

            /*--------------------------------------------------------------------------------------------------------*/

            message['children'].forEach((defXXX) => {

                if('@format' in defXXX)
                {
                    const m = /%\d*(?:\.(\d+))?f/.exec(defXXX['@format'].toString());

                    defXXX['$'] = (m?.[1] !== undefined) ? defXXX['$']
                                                           = Number.parseFloat(defXXX['$'].toString()).toFixed(Number.parseInt(m[1])).toString()
                                                         : defXXX['$']
                    ;
                }

                defXXX['@orig'] = defXXX['$'];
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* SET * VECTORS                                                                                              */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'].startsWith('set') && '@device' in message && '@name' in message && 'children' in message)
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const vector = nyxStore.defXXXVectorDict[_buildKey(message)];

            if(!vector)
            {
                return;
            }

            /*--------------------------------------------------------------------------------------------------------*/

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

            /*--------------------------------------------------------------------------------------------------------*/
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* DEL * VECTORS                                                                                              */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'delProperty' && '@device' in message && '@name' in message)
        {
            delete nyxStore.defXXXVectorDict[_buildKey(message)];
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* DEL INDI VECTORS                                                                                           */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'delINDIProperties')
        {
            Object.entries(nyxStore.defXXXVectorDict).forEach(([key, val]) => {

                if(val['@client'] === 'INDI') delete nyxStore.defXXXVectorDict[key];
            });
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* MESSAGES                                                                                                   */
        /*------------------------------------------------------------------------------------------------------------*/

        else if(message['<>'] === 'message')
        {
            let list;

            if(message['@device'] in nyxStore.messageDict)
            {
                list = nyxStore.messageDict[message['@device']] /**/;
            }
            else
            {
                list = nyxStore.messageDict[message['@device']] = [];
            }

            list.unshift({
                timestamp: message['@timestamp'] || '',
                message: message['@message'] || '',
            });
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _buildNewTextVectorMessage_func = (defTextVector) => {

    const result = {'<>': 'newTextVector', '@client': useNyxStore().clientId, '@device': defTextVector['@device'], '@name': defTextVector['@name'], 'children': []};

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

    const result = {'<>': 'newNumberVector', '@client': useNyxStore().clientId, '@device': defNumberVector['@device'], '@name': defNumberVector['@name'], 'children': []};

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

    const result = {'<>': 'newSwitchVector', '@client': useNyxStore().clientId, '@device': defSwitchVector['@device'], '@name': defSwitchVector['@name'], 'children': []};

    switch(defSwitchVector['@rule'])
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* OneOfMany                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'OneOfMany': {

            const def = defSwitchVector['children'][index];

            if (def) {
                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': 'On',
                });
            }

            break;
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* AtMostOne                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'AtMostOne': {

            defSwitchVector['children'].forEach((def, INDEX) => {

                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': index === INDEX ? (def['$'] === 'On' ? 'Off' : 'On') : 'Off',
                });
            });

            break;
        }

        /*------------------------------------------------------------------------------------------------------------*/
        /* AnyOfMany                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        case 'AnyOfMany': {

            defSwitchVector['children'].forEach((def, INDEX) => {

                result['children'].push({
                    '<>': 'oneSwitch',
                    '@name': def['@name'],
                    '$': index === INDEX ? (def['$'] === 'On' ? 'Off' : 'On') : def['$'],
                });
            });

            break;
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }

    return JSON.stringify(result);
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _enableBLOB_func = (blob, enabled) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const command = {'<>': 'enableBLOB', '@client': useNyxStore().clientId, '$': enabled ? 'Also' : 'Never'};

    if(Object.prototype.toString.call(blob) === '[object String]')
    {
        const parts = blob.split(':').map((part) => part.trim());

        command['@device'] = parts[0];
        if(parts.length > 1) {
            command['@name'] = parts[1];
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    _mqtt.emit('nyx/cmd/json', JSON.stringify(command, null, 2));

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _enableStream_func = (stream, enabled) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const command = {'<>': 'enableStream', '@client': useNyxStore().clientId, '$': enabled ? 'Also' : 'Never'};

    if(Object.prototype.toString.call(stream) === '[object String]')
    {
        const parts = stream.split(':').map((part) => part.trim());

        command['@device'] = parts[0];
        if(parts.length > 1) {
            command['@name'] = parts[1];
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    _mqtt.emit('nyx/cmd/json', JSON.stringify(command, null, 2));

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('nyx', {
            /* INITIALISATION */
            init: _init_func,
            final: _final_func,
            /* MESSAGES */
            buildNewTextVectorMessage: _buildNewTextVectorMessage_func,
            buildNewNumberVectorMessage: _buildNewNumberVectorMessage_func,
            buildNewSwitchVectorMessage: _buildNewSwitchVectorMessage_func,
            /* BLOBS & STREAMS */
            enableBLOB: _enableBLOB_func,
            enableStream: _enableStream_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
