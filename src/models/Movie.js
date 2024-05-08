// Lodash is a JS library that works on top of underscore.js
const _ = require('lodash');

/* This method appears to create an object 'this' which is then assigned 'id', 'duration' and 'votes'
properties. */
function Movie(_node) {
  /* _.extend() 
  A method from underscore.js https://www.geeksforgeeks.org/underscore-js-_-extend-function/
  Used to create a copy of all properties of source objects (_node.properties) 
  over the destination object (this) */
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id.toNumber();
  }
  if (this.duration) {
    this.duration = this.duration.toNumber();
  }
  if (this.votes) {
    this.votes = this.votes.toNumber();
  } else {
    this.votes = 0;
  }
}

/* In Node.js every file is treated as a module that can export values to be used by other modules.
'modules.exports' is an object in a a Node.js file that holds the exported values and functions from that module.
Declaring a module.exports object in a file specifies the values to be exported from that file. When exported, another module can import these values with the 'require' method.
*/
module.exports = Movie;
