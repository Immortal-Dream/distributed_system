/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */
const util = require('../util/util');

/**
 * @typedef {Object} Target
 * @property {string} service
 * @property {string} method
 * @property {Node} node
 */
const http = require("http");


/**
 * Sends a message to a remote service via HTTP PUT request.
 * @param {Array} message
 * @param {Target} remote
 * @param {Callback} [callback]
 * @return {void}
 */
function send(message, remote, callback) {
    const hasCallback = typeof callback === 'function';
    let jsonMessage;

    try {
        jsonMessage = util.serialize(message);
    } catch (e) {
        if (hasCallback) {
            callback(e);
        }
        return;
    }

    const node = remote.node;
    const path = `/${node.gid}/${remote.service}/${remote.method}`;
    const options = {
        host: node.host,
        port: node.port,
        path: path,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonMessage)
        }
    };

    const req = http.request(options, (res) => {
        if (!hasCallback) {
            res.resume(); // Drain the response if no callback
            return;
        }

        let chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
            const body = chunks.length > 0 ? Buffer.concat(chunks).toString() : '';
            if (res.statusCode === 200) {
                try {
                    const result = util.deserialize(body);
                    callback(null, result);
                } catch (e) {
                    callback(new Error('Failed to parse JSON response'));
                }
            } else {
                let errMsg;
                try {
                    const errorBody = util.deserialize(body);
                    errMsg = errorBody.error || body;
                } catch (e) {
                    errMsg = body;
                }
                const error = new Error(`Request failed with status code ${res.statusCode}: ${errMsg}`);
                error.statusCode = res.statusCode;
                callback(error);
            }
        });
    });

    req.on('error', (err) => {
        if (hasCallback) {
            callback(err);
        }
    });

    req.write(jsonMessage);
    req.end();
}

module.exports = { send };
