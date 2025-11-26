// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as uuid from 'uuid';

import * as paho from 'paho-mqtt';

/*--------------------------------------------------------------------------------------------------------------------*/

import useNyxStore from '../stores/nyx';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const CONNECTING = 0;
const CONNECTED = 1;
const DISCONNECTING = 2;
const DISCONNECTED = 3;

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
        try
        {
            /*--------------------------------------------------------------------------------------------------------*/

            if(_connectionCallback)
            {
                _connectionCallback(DISCONNECTING);
            }

            /*--------------------------------------------------------------------------------------------------------*/

            _client.disconnect();

            /*--------------------------------------------------------------------------------------------------------*/
        }
        catch(_)
        {
            /* IGNORE */
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return new Promise((resolve, reject) => {

        /*------------------------------------------------------------------------------------------------------------*/

        if(endpoint)
        {
            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                if(_connectionCallback)
                {
                    _connectionCallback(CONNECTING);
                }

                /*----------------------------------------------------------------------------------------------------*/

                const url = new URL(_endpoint = endpoint);

                _client = new paho.Client(url.hostname, parseInt(url.port || '443'), url.pathname, uuid.v4());

                /*----------------------------------------------------------------------------------------------------*/

                _client.onConnected = () => {

                    _connected = true;

                    useNyxStore().isConnected = true;

                    if(_connectionCallback)
                    {
                        _connectionCallback(CONNECTED);
                    }
                };

                /*----------------------------------------------------------------------------------------------------*/

                _client.onConnectionLost = () => {

                    _connected = false;

                    useNyxStore().isConnected = false;

                    if(_connectionCallback)
                    {
                        _connectionCallback(DISCONNECTED);
                    }
                };

                /*----------------------------------------------------------------------------------------------------*/

                _client.onMessageArrived = (message) => {

                    if(_messageCallback)
                    {
                        _messageCallback(
                            message.topic,
                            message.payloadString
                        );
                    }
                };

                /*----------------------------------------------------------------------------------------------------*/

                _client.connect({
                    useSSL: url.protocol === 'wss:',
                    userName: username || '',
                    password: password || '',
                    reconnect: true,
                    onSuccess: () => {

                        resolve('Successfully connected :-)');
                    },
                    onFailure: (e) => {

                        reject(e.errorMessage);
                    }
                })

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(e)
            {
                _client = null;

                reject(`${e}`);
            }
        }
        else
        {
            _client = null;

            reject('Empty URL');
        }

        /*------------------------------------------------------------------------------------------------------------*/
    });
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

export default {

    install(app)
    {
        app.provide('mqtt', {
            CONNECTING           : CONNECTING                 ,
            CONNECTED            : CONNECTED                  ,
            DISCONNECTING        : DISCONNECTING              ,
            DISCONNECTED         : DISCONNECTED               ,
            connected            : _connected_func            ,
            update               : _update_func               ,
            setConnectionCallback: _setConnectionCallback_func,
            setMessageCallback   : _setMessageCallback_func   ,
            subscribe            : _subscribe_func            ,
            unsubscribe          : _unsubscribe_func          ,
            emit                 : _emit_func                 ,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
