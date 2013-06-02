var Mongo   = require('mongodb'),
    Client  = Mongo.MongoClient,
    Db      = Mongo.Db,
    Server  = Mongo.Server,
    url     = require('url');

/* Mangos.js
 * ==========================
 * Small library to make MongoDB CRUD 
 */

/* @Constructor Mango
 * @Param       database  String  - Datatbase or collection name
 * @Param       host      String  - Location of MongoDB Server
 * @Param       port      Number  - The port this the server is running at
 */
var Mango = function(database, host, port) {
  // Create a database object
  var self = this;
  this._database = database;
  if(port){
    this.db = new Db(database, new Server(host, port, {auto_reconnect: true}, {}), {safe:true});
    this.db.open(function(){
      self.ready = true
    });
  }else{
    var uri = (host) ? host : database;
    Client.connect(uri, {}, this.connectCB);
    this.uri = function(d){return d}(database)
    database = (host) ? database : url.parse(database).pathname.replace(/^\//, '')
  }
};
/* @Basic-Utility
 * @Method    connectCB - function this handles connections using mongo uris
 * @Param     error - Error passed to this function via mongoddb native 
 * @Param     database - the database object to query
 */
Mango.prototype.connectCB = function(err, database){
  if(err) this.error(err, function(){})
  else{
    this.db = database;
    this.ready = true
  }
};
/* @Basic-Utility
 * @Method    error - Function this spits out error to console and callback (Keeps functions clean)
 * @Param     err       Object    - The error spit out be MongoDB native
 * @Param     callback  Function  - Function to pass data to  
 */
Mango.prototype.error = function(err, callback){
  callback(err);
  console.log(err);
}; 
/* @Basic-Utility
 * @Method    hex - Create hex for _id
 * @Param     collection  Object  - A collection object from MongoDB native
 * @Param     str         String  - String to create Hex string from
 * @Returns   - Returns a hex string
 */
Mango.prototype.hex = function(collection, str){
  return collection.db.bson_serializer.ObjectID.createFromHexString(str);
};
/* @Basic-Utility
 * @Method    getCollection - Get collection
 * @Param     callback      Function  - Function to pass data to
 */
Mango.prototype.collection = function(callback){
  if(this.ready){
    this.db.collection(this._database, function(err, collection){
      if(err) this.error(err, callback);
      else callback(null, collection);
    });
  }else{
    var self = this;
    setTimeout(function(){
      self.collection(callback); // polling
    }, 500);
  }
};
/* @Basic-Utility
 * @Method   index - add an index to collection
 * @Param    index    Object  - Holds the key to index
 * @Param    callback Function - Function this will pass back data 
 */
Mango.prototype.index = function(index, callback){
  this.collection(function(err, collection){
    if(err) this.error(err, callback)
    else{
      collection.ensureIndex(index, function(err, results){
        if(err) this.error(err, callback);
        else callback(null, results);
      });
    }
  });
};
/* @Read-Utility
 * @Method    all - Get all results
 * @Param     callback    Function  - Function to pass data to
 */
Mango.prototype.all = function(callback){
  this.collection(function(err, collection){
    if(err) this.error(err, callback)
    else{
      collection.find().toArray(function(err, results){
        if(err) this.error(err, callback)
        else callback(null, results)
      }); 
    }
  });
};
/* @Read-Utility
 * @Method   find - Search function
 * @Param    filter       Object    - Object to filter results with
 * @Param    callback     Function  - Function to pass data to
 */
Mango.prototype.find = function(filter, callback){
  var self = this;
  this.collection(function(err, collection){
    if(err) this.error(err, callback)
    else{
      if(filter.id) filter._id = self.hex(collection, filter.id);
      delete filter.id;
      collection.find(filter).toArray(function(error, results){
        if(err) self.error(err, callback)
        else callback(null, results)
      });
    } 
  })
};
/* @Create
 * @Method  create - Creating new entries
 * @Param   dataset   Object    - Data to insert into database
 * @Param   callback  Function  - Function to pass data to
 */
Mango.prototype.create = function(dataset, callback){
  var self = this;
  this.collection(function(error, collection) {
    if(error) self.error(error, callback)
    else {
      if(typeof dataset.length === "undefined")
        dataset = [dataset];
      for( var i =0;i < dataset.length; i++ ) {
        data = dataset[i];
      }
      collection.insert(dataset, {safe: true}, function(err, results) {
        if(err) self.error(err, callback)
        else callback(null, results)
      });
    }
  });
};
/* @Read
 * @Method  read - Read exsisting entries
 * @Param   filter       Object    - Object to filter results with ~ Optional first argument will become callback if not object
 * @Param   callback     Function  - Function to pass data to
 */
Mango.prototype.read = function(filter, callback){
  var self = this;
  if(typeof filter === 'object'){
    this.find(filter, function(err, results){
      if(err) self.error(err, callback)
      else callback(null, results)
    });
  }else{
    callback = filter;
    this.all(function(err, results){
      if(err) self.error(err, callback)
      else callback(null, results);
    });
  }
};
/* @Update
 * @Method  update - Update entries in database
 * @Param   dataset   Object    - Data to update in database ~ Requires id to select specific entry
 * @Param   callback  Function  - Function to pass data to
 */
Mango.prototype.update = function(dataset, callback){
  var self = this;
  this.collection(function(err, collection){
    if(err) this.error(err, callback)
    else{
      var id = self.hex(collection, dataset.id);
      delete dataset.id;
      collection.findAndModify({_id: id}, [['_id', 'asc']], {$set: dataset}, {new:true}, function(err, results){
        if(err) self.error(err, calback)
        else callback(null, results)
      })
    }
  })
};
/* @Delete
 * @Method  delete - Delete entries in database
 * @Param   id        String    - Id of specific entry
 * @Param   callback  Function  - Function to pass data to
 */
Mango.prototype.delete = function(dataset, callback){
  var self = this;
  this.collection(function(err, collection) {
    if(err) self.error(err, callback)
    else {
      dataset._id = self.hex(collection, dataset.id);
      delete dataset.id;
      collection.findAndRemove(dataset, function(err, results) {
        if(err) self.error(err, callback)
        else callback(null, results)
      });
    }
  });
};

module.exports = Mango;