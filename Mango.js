var Mongo   = require('mongodb'),
    Client  = Mongo.MongoClient,
    Db      = Mongo.Db,
    Server  = Mongo.Server;

/* Mangos.js
 * ==========================
 * Small library to make MongoDB CRUD 
 */

/* @Constructor Mango
 * @Param       database  String  - Datatbase or collection name
 * @Param       host      String  - Location of MongoDB Server
 * @Param       port      Number  - The port that the server is running at
 */

var Mango = function(database, host, port) {

  var that = this;
  /* @Basic-Utility
   * @Method    connectCB - function that handles connections using mongo uris
   * @Param     error - Error passed to this function via mongoddb native 
   * @Param     database - the database object to query
   */
  that.connectCB = function(err, database){
    if(err) that.error(err, function(){})
    else{
      that.db = database;
    }
  };
  /* @Basic-Utility
   * @Method    error - Function that spits out error to console and callback (Keeps functions clean)
   * @Param     err       Object    - The error spit out be MongoDB native
   * @Param     callback  Function  - Function to pass data to  
   */
  that.error = function(err, callback){
    callback(err);
    console.log(err);
  }; 
  /* @Basic-Utility
   * @Method    hex - Create hex for _id
   * @Param     collection  Object  - A collection object from MongoDB native
   * @Param     str         String  - String to create Hex string from
   * @Returns   - Returns a hex string
   */
  that.hex = function(collection, str){
    return collection.db.bson_serializer.ObjectID.createFromHexString(str);
  };
  /* @Basic-Utility
   * @Method    getCollection - Get collection
   * @Param     callback      Function  - Function to pass data to
   */
  that.getCollection = function(callback){
    that.db.collection(database, function(err, collection){
      if(err) that.error(err, callback);
      else callback(null, collection);
    });
  };
  /* @Read-Utility
   * @Method    all - Get all results
   * @Param     callback    Function  - Function to pass data to
   */
  that.all = function(callback){
    that.getCollection(function(err, collection){
      if(err) that.error(err, callback)
      else{
        collection.find().toArray(function(err, results){
          if(err) that.error(err, callback)
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
  that.find = function(filter, callback){
    that.getCollection(function(err, collection){
      if(err) that.error(err, callback)
      else{
        collection.find(filter).toArray(function(error, results){
          if(err) that.error(err, callback)
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
  that.create = function(dataset, callback){
    that.getCollection(function(error, collection) {
      if(error) that.error(error, callback)
      else {
        if(typeof dataset.length === "undefined")
          dataset = [dataset];

        for( var i =0;i < dataset.length; i++ ) {
          data = dataset[i];
          data.created_at = new Date();
        }

        collection.insert(dataset, {safe: true}, function(err, results) {
          if(err) that.error(err, callback)
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
  that.read = function(filter, callback){
    if(typeof filter === 'object'){
      that.find(filter, function(err, results){
        if(err) that.error(err, callback)
        else callback(null, results)
      });
    }else{
      callback = filter;
      that.all(function(err, results){
        if(err) that.error(err, callback)
        else callback(null, results);
      });
    }
  };
  /* @Update
   * @Method  update - Update entries in database
   * @Param   dataset   Object    - Data to update in database ~ Requires id to select specific entry
   * @Param   callback  Function  - Function to pass data to
   */
  that.update = function(dataset, callback){
    this.getCollection(function(err, collection){
      if(err) that.error(err, callback)
      else{
        collection.findAndModify({_id: that.hex(collection, dataset.id)}, [['_id', 'asc']], {$set: dataset}, {new:true}, function(err, results){
          if(err) that.error(err, calback)
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
  that.delete = function(id, callback){
    that.getCollection(function(err, collection) {
      if(err) that.error(err, callback)
      else {
        collection.findAndRemove({_id: that.hex(collection, id)}, function(err, results) {
          if(err) that.error(err, callback)
          else callback(null, results)
        });
      }
    });
  };
  // Create a database object
  if(port){
    that.db = new Db(database, new Server(host, port, {auto_reconnect: true}, {}), {safe:true});
    that.db.open(function(){});
  }else{
    Client.connect(database, {}, that.connectCB);
  }
};
module.exports = Mango;