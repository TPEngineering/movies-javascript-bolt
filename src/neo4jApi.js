/*
========================================
// This appears to be the file which contains all the cypher queries as javascript functions.
// The result of each function is to produce a record which can be consumed later.
===========================================
*/

// Neoj4 driver module
require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');

// These are modules (files) which are defined in this solution. 
const Movie = require('./models/Movie');
const MovieCast = require('./models/MovieCast');

// Some other fuckin' javascript library
const _ = require('lodash');

// 'window' is a global javascript object. All global javascript objects, functions, and variables automatically becomes memebers of the window object.
const neo4j = window.neo4j;

// 'process' is a core module of node.js and provides a 'env' property which holds all the environment variables that were set at the moment the process was started.
const neo4jUri = process.env.NEO4J_URI;

let neo4jVersion = process.env.NEO4J_VERSION;
if (neo4jVersion === '') {
  // assume Neo4j 4 by default
  neo4jVersion = '4';
}

// 'database' is defined in the Webpack.config.js file as being 'Movies' so it is the name of the database you are connected to.
let database = process.env.NEO4J_DATABASE;

// I have no idea why you'd want to do this.
if (!neo4jVersion.startsWith("4")) {
  database = null;
}

// Create the driver object, which can be used to run cypher queries later.
const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

// Log this, bitch
console.log(`Database running at ${neo4jUri}`)

/* This method searches a Neo4j database by 
*/
function searchMovies(title) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run('MATCH (movie:Movie) \
      WHERE toLower(movie.title) CONTAINS toLower($title) \
      RETURN movie',
      {title})
    )
    .then(result => {
      return result.records.map(record => {
        return new Movie(record.get('movie'));
      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getMovie(title) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run("MATCH (movie:Movie {title:$title}) \
      OPTIONAL MATCH (movie)<-[r]-(person:Person) \
      RETURN movie.title AS title, \
      collect([person.name, \
           head(split(toLower(type(r)), '_')), r.roles]) AS cast \
      LIMIT 1", {title}))
    .then(result => {
      if (_.isEmpty(result.records))
        return null;

      const record = result.records[0];
      return new MovieCast(record.get('title'), record.get('cast'));
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function voteInMovie(title) {
  const session = driver.session({ database: database });
  return session.writeTransaction((tx) =>
      tx.run("MATCH (m:Movie {title: $title}) \
        SET m.votes = coalesce(m.votes, 0) + 1", { title }))
    .then(result => {
      return result.summary.counters.updates().propertiesSet
    })
    .finally(() => {
      return session.close();
    });
}

// This is the important method! Puts the whole graph into two arrays, 'nodes' and 'rels' for consumption later.
function getGraph() {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
    tx.run('MATCH (m:Movie)<-[:ACTED_IN]-(a:Person) \
    RETURN m.title AS movie, collect(a.name) AS cast \
    LIMIT $limit', {limit: neo4j.int(100)}))
    .then(results => {
      const nodes = [], rels = [];
      let i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('movie'), label: 'movie'});
        const target = i;
        i++;

        res.get('cast').forEach(name => {
          const actor = {title: name, label: 'actor'};
          let source = _.findIndex(nodes, actor);
          if (source === -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });
      //  This return statement is apparently using the "Revealing module pattern". 
      return {nodes, links: rels};
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;
exports.voteInMovie = voteInMovie;

