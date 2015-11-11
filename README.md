# Multilocalprimus
Fork of metroplex to allow multiple primus instances on the same server . Eg Cluster Using PM2
First Version, ... in dev ...

## Installation

Metroplex is released in the npm registry and can therefor be installed using:

```
npm install --save multilocalprimus
```

## Usage Example
```js
'use strict';

var http = require('http').createServer()
  , Primus = require('primus');
  
var RedisScalling = {database:0,port:6379,host:127.0.0.1};

var primus = new Primus(http,{ transformer:'websockets',namespace: 'webchat:multilocalprimus',redis: RedisScalling, pid:process.pid });

primus.use('multilocalprimus', require('multilocalprimus'));
```

#### multilocalprimus.spark

```js
var _spark = primus.spark(id);
if(_spark === undefined){
		return sendToMultiLocalPrimus(id);
}else{
	return _spark; 
}
```

If not in current primus instance publish to the registed one.
return a dummy spark width "write" function. The call of ".write" make the publish to redis
##### sendToMultiLocalPrimus

```js
var sendToMultiLocalPrimus = function(id){
    var proxyspark={};
    proxyspark.write = function(){};
    try{ 
        return Q.promise(function (done, fail) {
            proxyspark={};
            server.primus.multilocalprimus.spark(id, function (err, defserver) {
                if(typeof server.primus.multilocalprimus.redis === 'object' && typeof server.primus.multilocalprimus.redis.publish === 'function'){
                    proxyspark.id = id;
                    proxyspark.server = defserver;
                    proxyspark.write = function(obj){
                        primus.multilocalprimus.redis.publish('webchat:multilocalprimus:'+defserver+'sub',JSON.stringify({obj:obj,id:id,server:defserver}));
                    }
                    done(proxyspark);
                }else{
                    done(proxyspark);
                }
            });
        }).then(function(action){
            return action;
        });
    }catch(e){
        return proxyspark;
    }
}
```

## License

[MIT](LICENSE)
