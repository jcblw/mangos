## Mangos

#### mango_js is now mangos

Mangos.js is a simple module to make MongoDB syntax CRUD. It uses and exposes controls straight from MongoDB's Native driver

#### Documentation in the code!

## Install

```shell
npm install mangos
```
you can install it locally for development by doing this

```shell
git clone https://github.com/jacoblwe20/mango_js.git
cd ~/your_app
npm install ../mango_js
```

then in your code

```javascript
// to include
var Mangos = require('mangos');
//to use
var userSet = new Mangos('users', 'localhost', 27017);
// or with a mongo uri
var locations = new Mangos('locations', 'mongodb://admin:supersecret@cooldbs.io/yourdb');
// Dont do this the code is not synchronous
userSet.create({name : 'Jacob'}, function(err, user){
  // if no error user is created
  console.log(user._id);
});

userSet.read({name : 'Jacob'},function(err, users){
  console.log(users); // array of users with Jacob as name
});

userSet.update({id : '50e3bdb52fc1c5d15a000001', status : 'active'}, function(err, user){
  // if no err user is updated
});

userSet.delete('50e3bdb52fc1c5d15a000001', function(err, user){
  // if no error user is deleted
});

```

Not enough control... well you can still use the native driver

```javascript
userSet.db.open()
// Mongo Db Native Driver Object
userSet.db.collectionNames(function(err, names){
	console.log(names);
});
userSet.db.close()
```

