// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as uuid from 'uuid';

import * as paho from 'paho-mqtt';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let _client = null;
let _endpoint = null;
let _connectionCallback = null;
let _messageCallback = null;
let _connected = false;

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _connected_func = () => !!_client && !!_endpoint && _connected;

/*--------------------------------------------------------------------------------------------------------------------*/

const _update_func = (endpoint, username, password) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    if(_client)
    {
        if(_endpoint !== endpoint)
        {
            try { _client.disconnect(); } catch (_) { /* IGNORE */ }
        }
        else
        {
            return;
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    if(endpoint)
    {
        try
        {
            /*--------------------------------------------------------------------------------------------------------*/

            const url = new URL(_endpoint = endpoint);

            _client = new paho.Client(url.hostname, parseInt(url.port || '443'), url.pathname, uuid.v4());

            /*--------------------------------------------------------------------------------------------------------*/

            _client.onConnected = () => {

                _connected = true;

                useNyxStore().isConnected = true;

                if(_connectionCallback) {
                    _connectionCallback(true);
                }
            };

            /*--------------------------------------------------------------------------------------------------------*/

            _client.onConnectionLost = () => {

                _connected = false;

                useNyxStore().isConnected = false;

                if(_connectionCallback) {
                    _connectionCallback(false);
                }
            };

            /*--------------------------------------------------------------------------------------------------------*/

            _client.onMessageArrived = (message) => {

                if(_messageCallback)
                {
                    _messageCallback(
                        message.topic,
                        message.payloadString
                    );
                }
            };

            /*--------------------------------------------------------------------------------------------------------*/

            _client.connect({
                useSSL: url.protocol === 'wss:',
                userName: username || '',
                password: password || '',
                reconnect: true,
            });

            /*--------------------------------------------------------------------------------------------------------*/
        }
        catch(e)
        {
            console.error(e);

            _client = null;
        }
    }
    else
    {
        _client = null;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _setConnectionCallback_func = (callback) => {

    _connectionCallback = typeof callback === 'function' ? callback : null;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _setMessageCallback_func = (callback) => {

    _messageCallback = typeof callback === 'function' ? callback : null;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _subscribe_func = (topic) => {

    if(_client)
    {
        _client.subscribe(topic, {
            timeout: 5000,
            onFailure: (x, y, errorMessage) => {

                console.log(`Error subscribing to topic \`${topic}\`: ${errorMessage}`);
            },
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _unsubscribe_func = (topic) => {

    if(_client)
    {
        _client.unsubscribe(topic, {
            timeout: 5000,
            onFailure: (x, y, errorMessage) => {

                console.log(`Error unsubscribing to topic \`${topic}\`: ${errorMessage}`);
            },
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _emit_func = (topic, payload) => {

    if(_connected_func())
    {
		const message = new paho.Message(payload);

		message.topic    = topic;
		message.qos      = 0x000;
		message.retained = false;

		_client.send(message);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _enableBLOB_func = (enabled, device = null, name = null) => {

    const status = enabled ? 'Alse' : 'Never';

    if(device)
    {
        if(name) {
            _emit_func('nyx/cmd/json' , `{"<>": "enableBLOB", "@device": "${device}", "@name": "${name}", "$": "${status}"}`);
        }
        else {
            _emit_func('nyx/cmd/json' , `{"<>": "enableBLOB", "@device": "${device}", "$": "${status}"}`);
        }
    }
    else {
        _emit_func('nyx/cmd/json' , `{"<>": "enableBLOB", "$": "${status}"}`);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _enableStream_func = (enabled, device = null, name = null) => {

    const status = enabled ? 'Alse' : 'Never';

    if(device)
    {
        if(name) {
            _emit_func('nyx/cmd/json' , `{"<>": "enableStream", "@device": "${device}", "@name": "${name}", "$": "${status}"}`);
        }
        else {
            _emit_func('nyx/cmd/json' , `{"<>": "enableStream", "@device": "${device}", "$": "${status}"}`);
        }
    }
    else {
        _emit_func('nyx/cmd/json' , `{"<>": "enableStream", "$": "${status}"}`);
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('mqtt', {
            connected            : _connected_func            ,
            update               : _update_func               ,
            setConnectionCallback: _setConnectionCallback_func,
            setMessageCallback   : _setMessageCallback_func   ,
            subscribe            : _subscribe_func            ,
            unsubscribe          : _unsubscribe_func          ,
            emit                 : _emit_func                 ,
            enableBLOB           : _enableBLOB_func           ,
            enableStream         : _enableStream_func         ,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
