module.exports = function(Mango){ // import Mango

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

}