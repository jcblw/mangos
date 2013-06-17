var
_ = require("underscore");

module.exports = function( Mango ){ // import Mangos

  /* @Basic-Utility
  * @Method    getCollection - Get collection
  * @Param     callback      Function  - Function to pass data to
  */
  Mango.prototype.collection = function( callback ){
    if( this.ready ){
      this.db.collection( this._collection, function( err, collection ){
        if(err) this.error( err, callback );
        else callback( null, collection );
      });
    }else{
      var self = this;
      setTimeout( function(){
        self.collection( callback ); // polling
      }, 500 );
    }
  };

  Mango.prototype.Collection = function( name, options ){
    this._collection = name;
    
    if(options){
      options = {}
    }

    this.allowOnly = options.allowOnly || [];
    this.privateKeys = options.privateKeys || [];
    this.collectionDefaults = options.defaults || {};

    return Object.create( this ); // returns a clone of this
  };

  Mango.prototype.model = function( collection ){
    if( 
      Array.isArray( collection ) && 
      ( this.allowOnly ||
        this.privateKeys ||
        this.collectionDefaults )
    ){
      // each key of each item in collection
      collection.forEach( function( model, i ){  

        if( Array.isArray( this.privateKeys ) ){
          this.privateKeys.forEach( function( val, index ){
            if( model[val] ){
              delete model[val]; // remove private keys
            }
          })
        }
        
        
        if( Array.isArray( this.allowOnly ) ){
          // grab only allowed keys
          model = _.pick.apply( this, [model, "_id"].concat( this.allowOnly ) );
        }

        if( typeof this.collectionDefaults === 'object' ){
          // extend defaults 
          model = _.extend( {}, this.collectionDefaults, model ); 
        }

      }, this );

    }

    return collection;
  };

};

// example of optimal usage
// https://gist.github.com/jacoblwe20/5745798