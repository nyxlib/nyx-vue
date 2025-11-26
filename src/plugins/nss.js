/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let _endpoint = '';

let _token = '';

const _streamMap = new Map();

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _endpoint_func = () => _endpoint;

/*--------------------------------------------------------------------------------------------------------------------*/

const _computeToken = (username, password) => {

    return new Promise((resolve) => {

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${username}:${password}`)).then((buffer) => {

            resolve(Array.from(new Uint8Array(buffer).slice(0, 8)).map((b) => b.toString(16).padStart(2, '0'))
                                                                  .join('')
            );
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _update_func = (endpoint, username, password) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    _endpoint = endpoint;

    /*----------------------------------------------------------------------------------------------------------------*/

    if(username && password)
    {
        _computeToken(username, password).then((token) => {

            _token = token;
        });
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _parseInt = (s) => {

    const result = parseInt(s);

    if(!Number.isFinite(result))
    {
        throw new Error('Invalid length');
    }

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _parseNyxRESP = (buffer) => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const textDecoder = new TextDecoder('utf-8');

    const result = {};

    let offset = 0;

    /*----------------------------------------------------------------------------------------------------------------*/

    const readLine = () => {

        const s = offset;
        while(offset < buffer.length && buffer[offset] !== 0x0D) offset++; // look for '\r'
        const e = offset;

        if(buffer[offset++] !== 0x0D
           ||
           buffer[offset++] !== 0x0A
        ) {
            throw new Error('Expected CRLF after line');
        }

        return buffer.subarray(s, e);
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    const readLengthLine = (expectedPrefix) => {

        if(buffer[offset++] !== expectedPrefix)
        {
            throw new Error('Expected prefix ' + String.fromCharCode(expectedPrefix));
        }

        return _parseInt(textDecoder.decode(readLine()));
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    const readBlock = (len) => {

        const result = buffer.subarray(offset, offset + len); offset += len;

        if(buffer[offset++] !== 0x0D
           ||
           buffer[offset++] !== 0x0A
        ) {
            throw new Error('Expected CRLF after data block');
        }

        return result;
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    const match = textDecoder.decode(readLine()).match(/^nyx-stream\[(\d+)]$/);

    if(!match)
    {
        throw new Error('Invalid stream header');
    }

    for(let i = 0; i < _parseInt(match[1]); i++)
    {
        const keyLen = readLengthLine(0x24); // '$'
        const key = textDecoder.decode(readBlock(keyLen));

        const valLen = readLengthLine(0x24); // '$'
        result[key] = /*------------*/(readBlock(valLen));
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _check_func = (endpoint, username, password) => {

    return new Promise((resolve, reject) => {

        if(endpoint)
        {
            _computeToken(username, password).then((token) => {

                /*----------------------------------------------------------------------------------------------------*/

                const url = new URL(endpoint.replace('ws://', 'http://').replace('wss://', 'https://'));

                if(token)
                {
                    url.searchParams.set('token', token);
                }

                /*----------------------------------------------------------------------------------------------------*/

                fetch(url).then((response) => {

                    response.text().then((data) => {

                        if((data || '').trim() !== 'Unauthorized')
                        {
                            resolve('Successfully connected :-)');
                        }
                        else
                        {
                            reject('Unauthorized');
                        }

                    }).catch(() => {

                        reject('Error');
                    });

                }).catch(() => {

                    reject('Error');
                });

                /*----------------------------------------------------------------------------------------------------*/
            });
        }
        else
        {
            reject('Error');
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _register_func = (stream, callback) => {

    if(!stream || !_endpoint || typeof callback !== 'function')
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    let entry = _streamMap.get(stream);

    if(!entry)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        entry = {
            socket: null,
            callbacks: new Set(),
        };

        /*------------------------------------------------------------------------------------------------------------*/

        const url = new URL(`/streams/${stream.replace(':', '/')}`, _endpoint);

        if(_token)
        {
            url.searchParams.set('token', _token);
        }

        /*------------------------------------------------------------------------------------------------------------*/

        entry.socket = new WebSocket(url);

        entry.socket.binaryType = 'arraybuffer';

        /*------------------------------------------------------------------------------------------------------------*/

        entry.socket.addEventListener('message', (e) => {

            if(e.data instanceof ArrayBuffer)
            {
                try
                {
                    const data = _parseNyxRESP(new Uint8Array(e.data));

                    for(const callback of entry.callbacks)
                    {
                        callback(data);
                    }
                }
                catch(e)
                {
                    console.error(e);
                }
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        entry.socket.addEventListener('close', () => {

            _streamMap.delete(stream);
        });

        /*------------------------------------------------------------------------------------------------------------*/

        _streamMap.set(stream, entry);

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    entry.callbacks.add(callback);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _unregister_func = (stream, callback) => {

    if(!stream || !_endpoint || typeof(callback) !== 'function')
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const entry = _streamMap.get(stream);

    if(entry)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        entry.callbacks.delete(callback);

        /*------------------------------------------------------------------------------------------------------------*/

        if(entry.callbacks.size === 0)
        {
            _streamMap.delete(stream);

            entry.socket.close();
        }

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    install(app)
    {
        app.provide('nss', {
            endpoint  : _endpoint_func  ,
            update    : _update_func    ,
            check     : _check_func     ,
            register  : _register_func  ,
            unregister: _unregister_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
