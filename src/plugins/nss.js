/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

let _url = '';

let _token = '';

const _streamMap = new Map();

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const _url_func = () => _url;

/*--------------------------------------------------------------------------------------------------------------------*/

const _computeToken = (username, password) => new Promise((resolve) => {

    if(username || password)
    {
        crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${username}:${password}`)).then((buffer) => {

            const result = Array.from(new Uint8Array(buffer).slice(0, 8)).map((b) => b.toString(16).padStart(2, '0'))
                                                                               .join('')
            ;

            resolve(result);

        }).catch(() => {

            resolve(null);
        });
    }
    else
    {
        resolve(null);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

const _update_func = (endpoint, username, password) => {

    _computeToken(username, password).then((token) => {

        try
        {
            _url = new URL(endpoint).toString();

            _token = token;
        }
        catch(e)
        {
            /* IGNORE */
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/

const NYX_STREAM_MAGIC = 0x5358594E;

/*--------------------------------------------------------------------------------------------------------------------*/

const _parseNyxBinaryStream = (buffer) => {

    if(buffer.byteLength < 12)
    {
        throw new Error('Frame too short');
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    let offset = 0;

    /*----------------------------------------------------------------------------------------------------------------*/

    const stream_magic = view.getUint32(offset, true); offset += 8;
    const payload_size = view.getUint32(offset, true); offset += 4;

    if(stream_magic !== NYX_STREAM_MAGIC)
    {
        throw new Error('Invalid NyxStream magic');
    }

    if(buffer.byteLength < 12 + payload_size)
    {
        throw new Error('Incomplete NyxStream frame');
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const result = {};

    let consumed = 0;

    while(consumed < payload_size)
    {
        if(payload_size - consumed < 8)
        {
            throw new Error('Truncated field header');
        }

        /*------------------------------------------------------------------------------------------------------------*/

        const field_hash = view.getUint32(offset, true); offset += 4;
        const field_size = view.getUint32(offset, true); offset += 4;

        consumed += 8;

        if(payload_size - consumed < field_size
            ||
            offset + field_size > buffer.byteLength
        ) {
            throw new Error('Truncated field data');
        }

        /*------------------------------------------------------------------------------------------------------------*/

        result[field_hash.toString(16).padStart(8, '0').toUpperCase()] = new Uint8Array(buffer.buffer, buffer.byteOffset + offset, field_size);

        /*------------------------------------------------------------------------------------------------------------*/

        offset   += field_size;
        consumed += field_size;

        /*------------------------------------------------------------------------------------------------------------*/
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    return result;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const _check_func = (endpoint, username, password) => new Promise((resolve, reject) => {

    _computeToken(username, password).then((token) => {

        try
        {
            /*--------------------------------------------------------------------------------------------------------*/

            // noinspection HttpUrlsUsage
            const url = new URL(endpoint.replace('ws://', 'http://').replace('wss://', 'https://'));

            if(token)
            {
                url.searchParams.set('token', token.toString());
            }

            /*--------------------------------------------------------------------------------------------------------*/

            fetch(url).then((response) => {

                if(response.ok)
                {
                    response.text().then((data) => {

                        if(data?.trim() !== 'Unauthorized')
                        {
                            resolve('Successfully connected :-)');
                        }
                        else
                        {
                            reject('Unauthorized access');
                        }

                    }).catch((_) => {

                        reject('Connection error');
                    });
                }
                else
                {
                    reject('Connection error');
                }

            }).catch((_) => {

                reject('Connection error');
            });

            /*--------------------------------------------------------------------------------------------------------*/

        }
        catch(e)
        {
            reject(e.message || `${e}`);
        }

        /*------------------------------------------------------------------------------------------------------------*/
    });
});

/*--------------------------------------------------------------------------------------------------------------------*/

const _register_func = (stream, callback) => {

    if(!_url || !stream || typeof callback !== 'function')
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

        const url = new URL(`/streams/${stream.replace(':', '/')}`, _url);

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
                    const data = _parseNyxBinaryStream(new Uint8Array(e.data));

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

    if(!_url || !stream || typeof(callback) !== 'function')
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
            url       : _url_func       ,
            update    : _update_func    ,
            check     : _check_func     ,
            register  : _register_func  ,
            unregister: _unregister_func,
        });
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
