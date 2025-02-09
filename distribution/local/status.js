const id = require('../util/id');
const log = require('../util/log');

const status = {};

global.moreStatus = {
  sid: id.getSID(global.nodeConfig),
  nid: id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function(configuration, callback) {
  callback = callback || function() { };
  // TODO: implement remaining local status items

  // Check if the requested configuration is in the global status
  if (global.moreStatus.hasOwnProperty(configuration)) {
    callback(null, global.moreStatus[configuration]);
    return;
  }

  // Check if the requested configuration is in the process memory usage
  if (configuration === 'heapTotal') {
    callback(null, process.memoryUsage().heapTotal);
    return;
  }
  if (configuration === 'heapUsed') {
    callback(null, process.memoryUsage().heapUsed);
    return;
  }
  callback(new Error('Status key not found'));
};


status.spawn = function(configuration, callback) {
  callback(new Error('Spawn function not implemented'));
};

status.stop = function(callback) {
  callback(new Error('Stop function not implemented'));callback(null, 'Node stopped');
};

module.exports = status;
