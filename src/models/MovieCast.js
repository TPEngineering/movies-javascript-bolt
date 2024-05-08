const _ = require('lodash');

/* This method makes a MovieCast object with the 'title' and 'cast' properties */
function MovieCast(title, cast) {
  _.extend(this, {
    title: title,
    cast: cast.map(function (c) {
      return {
        name: c[0],
        job: c[1],
        role: c[2]
      }
    })
  });
}

module.exports = MovieCast;
