/** @typedef {import("../types").Callback} Callback */
const distribution = require('../../config.js');
const id = require('../util/id.js');
/**
 * NOTE: This Target is slightly different from local.all.Target
 * @typdef {Object} Target
 * @property {string} service
 * @property {string} method
 */

/**
 * @param {object} config
 * @return {object}
 */
function comm(config) {
  const context = {};
  context.gid = config.gid || 'all';
  
  /**
   * @param {Array} message
   * @param {object} configuration
   * @param {Callback} callback
   */
  function send(message, configuration, callback) {
    let targetNodes = [];
    console.log("Configuration",JSON.stringify(configuration));
    if (configuration.node) {
      // If a specific node is provided, target only that node.
      targetNodes.push(configuration.node);
    } else {
      // Otherwise, get all nodes from the group membership.
      const groupNodes = getGroupNodes(context.gid);
      targetNodes = Object.values(groupNodes);
    }

    // If there are no target nodes, immediately invoke the callback.
    if (targetNodes.length === 0) {
      return callback({}, {});
    }
    // Prepare objects to collect aggregated errors and results.
    const aggregatedErrors = {};
    const aggregatedResults = {};
    let pending = targetNodes.length;

    targetNodes.forEach((node) => {
      const remote = {
        node: node,
        service: configuration.service,
        method: configuration.method,
      };
      distribution.local.comm.send(message, remote, (error, result) => {
        if (error) {
          aggregatedErrors[node.nid] = error;
        } else {
          aggregatedResults[node.nid] = result;
        }
        if (--pending === 0) {
          callback(aggregatedErrors, aggregatedResults);
        }
      });
    });

  }

  return { send };
};

module.exports = comm;
