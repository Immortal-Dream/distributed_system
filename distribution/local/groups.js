// Local storage for the mapping of group names to node sets
var groupsMapping = {};

// The groups service object
var groups = {};

/**
 * Retrieve the node-set for the given group name.
 * @param {string} name - The group name (GID).
 * @param {function} callback - Callback function(err, result)
 */
groups.get = function(name, callback) {
    if (!groupsMapping.hasOwnProperty(name)) {
      // Group not found: return an error and false value.
      return callback(new Error("Group not found: " + name), false);
    }
    callback(null, groupsMapping[name]);
  };
  

/**
 * Put a new group mapping.
 * This stores the node set under the given group name and instantiates
 * a corresponding distribution[gid] object.
 *
 * @param {string} name - The group name (GID).
 * @param {Object} config - An object mapping SIDs to node objects.
 * @param {function} callback - Callback function(err, result)
 */
groups.put = function(name, config, callback) {
    groupsMapping[name] = config;
    // Dynamically instantiate the distributed version of each service for this group.
    if (typeof distribution !== "undefined") {
      distribution[name] = {}; 
    }
    if (typeof callback === "function") {
      callback(null, config);
    }
  };
  

/**
 * Delete the entire group mapping for the given group name.
 *
 * @param {string} name - The group name.
 * @param {function} callback - Callback function(err, result)
 */
groups.del = function(name, callback) {
    if (!groupsMapping.hasOwnProperty(name)) {
      // Group not found: return an error and false value.
      return callback(new Error("Group not found: " + name), false);
    }
    // Capture the group mapping before deletion.
    const deletedGroup = groupsMapping[name];
    // Delete the group mapping.
    delete groupsMapping[name];
    // Also remove the corresponding distribution entry if it exists.
    if (typeof distribution !== "undefined" && distribution.hasOwnProperty(name)) {
      delete distribution[name];
    }
    callback(null, deletedGroup);
  };

/**
 * Helper function to obtain a SID (node identifier) from a node object.
 * If the node already has a 'sid' property, it is used; otherwise,
 * the SID is computed from its IP and port.
 *
 * @param {Object} node - The node object.
 * @returns {string} The computed SID.
 */
function getSID(node) {
  return node.sid || (node.ip + ":" + node.port);
}

/**
 * Add a node to the specified group.
 * If the group doesn't exist, this is a no-op.
 *
 * @param {string} name - The group name.
 * @param {Object|string} node - A node object (or its SID if already computed).
 * @param {function} [callback] - Optional callback function(err, result)
 */
groups.add = function(name, node, callback) {
    if (!groupsMapping.hasOwnProperty(name)) {
      if (typeof callback === "function") {
        return callback(new Error("Group not found: " + name), false);
      }
      return;
    }
    // Use the provided id.getSID function to compute the node's SID.
    const sid = (typeof node === "object") ? id.getSID(node) : node;
    groupsMapping[name][sid] = node;
    if (typeof callback === "function") {
      callback(null, groupsMapping[name]);
    }
  };
/**
 * Remove a node from the specified group.
 * If the group or the node does not exist, this is a no-op.
 *
 * @param {string} name - The group name.
 * @param {Object|string} node - A node object (or its SID).
 * @param {function} [callback] - Optional callback function(err, result)
 */
groups.rem = function(name, node, callback) {
  if (!groupsMapping[name]) {
    // Group does not exist; no-op.
    if (typeof callback === "function") {
      callback(null, undefined);
    }
    return;
  }
  var sid = (typeof node === "object") ? getSID(node) : node;
  if (groupsMapping[name].hasOwnProperty(sid)) {
    delete groupsMapping[name][sid];
  }
  if (typeof callback === "function") {
    callback(null, groupsMapping[name]);
  }
};

module.exports = groups;
