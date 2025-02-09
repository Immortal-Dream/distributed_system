/** @typedef {import("../types").Callback} Callback */

function routes(config) {
  const context = {};
  // Group ID for this context
  context.gid = config.gid || 'all';

  /**
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function put(service, name, callback = () => { }) {
    context.service[name] = service;
    callback(null, name);
  }
  /**
   * Retrieves a service by its name.
   * @param {string} name - The name of the service.
   * @param {Callback} callback - Callback function to return the service.
   */
  function get(name, callback) {
    if (context.services.hasOwnProperty(name)) {
      callback(null, context.services[name]); // Return the service object
    } else {
      callback(new Error("Service not found")); // Return error if service does not exist
    }
  }

  /**
   * Removes a service by its name.
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function rem(service, name, callback = () => { }) {
    if (context.services.hasOwnProperty(name)) {
      delete context.services[name];
      callback(null, name);
    } else {
      callback(new Error("Service not found"));
    }
  }

  return {put, get, rem};
}

module.exports = routes;
