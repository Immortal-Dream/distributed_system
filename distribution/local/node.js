const http = require('http');
const url = require('url');
const log = require('../util/log');
const util = require('../util/util');

/*
    The start function will be called to start your node.
    It will take a callback as an argument.
    After your node has booted, you should call the callback.
*/


const start = function (callback) {
  const server = http.createServer((req, res) => {
    /* Your server will be listening for PUT requests. */

    // Write some code...
    if (req.method !== 'PUT') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    /*
      The path of the http request will determine the service to be used.
      The url will have the form: http://node_ip:node_port/service/method
    */

    // Write some code...
    const parsedUrl = url.parse(req.url);
    const pathParts = parsedUrl.pathname.split('/').filter(part => part !== '');
    if (pathParts.length < 2) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const gid = pathParts[0];
    const serviceName = pathParts[1];
    const methodName = pathParts[2];

    /*

      A common pattern in handling HTTP requests in Node.js is to have a
      subroutine that collects all the data chunks belonging to the same
      request. These chunks are aggregated into a body variable.

      When the req.on('end') event is emitted, it signifies that all data from
      the request has been received. Typically, this data is in the form of a
      string. To work with this data in a structured format, it is often parsed
      into a JSON object using JSON.parse(body), provided the data is in JSON
      format.

      Our nodes expect data in JSON format.
  */

    // Write some code...
    let body = [];

    req.on('data', (chunk) => {
      // Collect each chunk of data.
      body.push(chunk);
    });

    req.on('end', () => {

      /* Here, you can handle the service requests.
      Use the local routes service to get the service you need to call.
      You need to call the service with the method and arguments provided in the request.
      Then, you need to serialize the result and send it back to the caller.
      */

      // Write some code...
      let args;
      try {
        const rawBody = Buffer.concat(body).toString();
        // debug 
        // args = JSON.parse(rawBody);
        args = util.deserialize(rawBody);
        if (!Array.isArray(args)) {
          throw new Error('Expected an array of arguments');
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(util.serialize({ error: e.message }));
        return;
      }

      const service = global.distribution[gid] && global.distribution[gid][serviceName];
      if (!service) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(util.serialize({ error: `Service ${serviceName} not found` }));
        return;
      }

      const method = service[methodName];
      if (typeof method !== 'function') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(util.serialize({ error: `Method ${methodName} not found in service ${serviceName}` }));
        return;
      }

      try {
        method(...args, (error, value) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(util.serialize({ error: error.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(util.serialize(value));
          }
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(util.serialize({ error: `Internal server error: ${e.message}` }));
      }
    });
  });


  // TODO: Write some code...

  /*
    Your server will be listening on the port and ip specified in the config
    You'll be calling the `callback` callback when your server has successfully
    started.

    At some point, we'll be adding the ability to stop a node
    remotely through the service interface.
  */

  server.listen(global.nodeConfig.port, global.nodeConfig.ip, () => {
    log(`Server running at http://${global.nodeConfig.ip}:${global.nodeConfig.port}/`);
    global.distribution.node.server = server;
    callback(server);
  });

  server.on('error', (error) => {
    // server.close();
    log(`Server error: ${error}`);
    throw error;
  });
};

module.exports = {
  start: start,
};
