// noinspection JSUnusedGlobalSymbols, JSUnresolvedReference
/*--------------------------------------------------------------------------------------------------------------------*/

import * as uuid from 'uuid';

import mqtt from 'mqtt';

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

            _client.end(true);

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

                let settled = false;

                /*----------------------------------------------------------------------------------------------------*/

                _client = mqtt.connect(url.toString(), {
                    clientId       : uuid.v4(),
                    username       : username || '',
                    password       : password || '',
                    reconnectPeriod: 1000,
                    clean          : true,
                });

                /*----------------------------------------------------------------------------------------------------*/

                _client.on('connect', () => {

                    _connected = true;

                    useNyxStore().isConnected = true;

                    if(_connectionCallback)
                    {
                        _connectionCallback(CONNECTED);
                    }

                    if(!settled)
                    {
                        settled = true;

                        resolve('Successfully connected :-)');
                    }
                });

                /*----------------------------------------------------------------------------------------------------*/

                _client.on('close', () => {

                    _connected = false;

                    useNyxStore().isConnected = false;

                    if(_connectionCallback)
                    {
                        _connectionCallback(DISCONNECTED);
                    }
                });

                /*----------------------------------------------------------------------------------------------------*/

                _client.on('error', (e) => {

                    if(!settled)
                    {
                        settled = true;

                        reject(`${e}`);
                    }
                });

                /*----------------------------------------------------------------------------------------------------*/

                _client.on('message', (topic, payload /*, packet */) => {

                    if(_messageCallback)
                    {
                        _messageCallback(
                            topic,
                            payload != null ? payload.toString() : ''
                        );
                    }
                });

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
        _client.subscribe(topic, (e) => {

            if(e)
            {
                console.log(`Error subscribing to topic \`${topic}\`: ${e.message || e}`);
            }
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _unsubscribe_func = (topic) => {

    if(_client)
    {
        _client.unsubscribe(topic, (e) => {

            if(e)
            {
                console.log(`Error unsubscribing from topic \`${topic}\`: ${e.message || e}`);
            }
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _emit_func = (topic, payload) => {

    if(_connected_func())
    {
        _client.publish(
            topic,
            payload,
            {
                qos: 2,
                retain: false,
            }
        );
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
