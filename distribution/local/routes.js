/** @typedef {import("../types").Callback} Callback */

/**
 * Routes service: Manages mapping between service names and configurations.
 */
const services = {};
const status = require('./status');
services['status'] = status;
/**
 * Get a service object by name
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function get(configuration, callback) {
    callback = typeof callback === 'function' ? callback : function() {};
    if (services.hasOwnProperty(configuration)) {
        callback(null, services[configuration]);
    } else {
        callback(new Error(`Service '${configuration}' not found`));
    }
}

/**
 * Register a new service object under a given name.
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function put(service, configuration, callback) {
    callback = typeof callback === 'function' ? callback : function() {};
    services[configuration] = service;
    callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
    callback = typeof callback === 'function' ? callback : function() {};
    if (services.hasOwnProperty(configuration)) {
        const removed = services[configuration];
        delete services[configuration];
        callback(null, removed);
    } else {
        callback(new Error(`Service '${configuration}' not found`));
    }
};

module.exports = { get, put, rem };
