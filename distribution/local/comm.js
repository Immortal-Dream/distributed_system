/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */
const util = distribution.util;



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
    // Construct the request options
    const options = {
        hostname: remote.node.ip, // Remote node IP
        port: remote.node.port, // Remote node port
        path: `/${remote.node.gid}/${remote.service}/${remote.method}`, // Construct the request path
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    };
    // Create the HTTP request
    const req = http.request(options, (res) => {
        let data = "";

        // Collect data chunks
        res.on("data", (chunk) => {
            data += chunk;
        });

        // Process response
        res.on("end", () => {
            try {
                const response = JSON.parse(data); // Parse JSON response
                if (response.error) {
                    callback(new Error(response.error)); // Pass error to callback
                } else {
                    callback(null, response.result); // Pass result to callback
                }
            } catch (err) {
                callback(new Error("Invalid JSON response"));
            }
        });
    });

    // Handle request errors
    req.on("error", (err) => {
        callback(err);
    });

    // Send the request with the serialized message
    req.write(JSON.stringify({ args: message }));
    req.end();
}

module.exports = { send };
