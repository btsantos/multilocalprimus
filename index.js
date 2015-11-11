'use strict';

//
// Expose the Multilocalprimus plugin.
//
var Multilocalprimus = module.exports = require('./multilocalprimus');

/**
 * Keep the presence or "state" of each connection in Redis.
 *
 * @param {Primus} primus The Primus instance that received the plugin.
 * @param {Object} options The options that were supplied to Primus.
 * @api public
 */
Multilocalprimus.server = function server(primus, options)  {
  var multilocalprimus = new Multilocalprimus(primus, options);

  primus.on('connection', function connection(spark) {
    multilocalprimus.connect(spark);
  }).on('disconnection', function disconnection(spark) {
    multilocalprimus.disconnect(spark);
  }).on('close', function close(options, next) {
    multilocalprimus.unregister(undefined, next);
  }).server.on('listening', function listening() {
    if (multilocalprimus.address) return;
    multilocalprimus.register(primus.server);
  });

  //
  // Register the Multilocalprimus event as `reserved` event so other plugins know
  // that they shouldn't be bluntly emitting this and proxy these events to the
  // Primus instance you can listen on the Primus server instead of the plugin.
  //
  ['register', 'unregister', 'error'].forEach(function each(event) {
    primus.reserved.events[event] = 1;
    multilocalprimus.on(event, primus.emits(event));
  });

  //
  // Expose the Multilocalprimus instance so we can interact with it.
  //
  primus.multilocalprimus = multilocalprimus;
  /*primus.transform('outgoing', function (packet, next) {
      var spark = this;
      console.log('\n\n------ spark ------\n');
      if(spark._data){
          console.log('----->',spark._data.id);
          if(spark._data.id){
            console.log('\n---------->', primus.spark(spark._data.id)._data.id);
          }
      }
      next();
  });*/
};
