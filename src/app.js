// This is essentially another head file which takes the records generated by neo4jApi.js 

// require() is a method introduced by Node.js to load a module (.js file). A lot of the functions in neo4jApi
// are used later in this file.
const api = require('./neo4jApi');

// $() The dollar sign ($) is used as a shortcut to the function document.getElementById().
// The $ is being used as an alternative since this function references a DOM element if we
// pass an element's id and now is used frequently in JavaScript to serve the purpose.
// Within JavaScript, it's just another character, but it is an overloaded function in jQuery, in fact
// this function is actually called jQuery, and $ is an alias.
// https://api.jquery.com/jQuery/
// $() in this case, has a single argument, function(){}.
// In this case, function(){} accepts no inputs, and just executes a number of different methods.
$(function () {

    // renderGraph() is defined later in this file.
    renderGraph();

    // search() is defined later in this file.
    search();

    // $().submit();
    // jQuery searches through the DOM for any elements called #search and creates a new jQuery object
    // that references these elements.
    // .submit() submits the form (the result of the jQuery search). This method was deprecated in v3.3.
    // The version this script assumes is at the bottom of the index.html file (v1.11.0).
    // The .submit() input parameter is of the following type: Function(Event eventObject)
    // => is the lamda operator, similar to that used in C#.
    // preventDefault() is a member of the Event interface, which turns off the default listener behavior.
    $("#search").submit(e => { e.preventDefault(); search(); });

});

function showMovie(title) {
  api
    .getMovie(title)
    .then(movie => {
        if (!movie) return;
        $("#title").text(movie.title);

        // .attr() is a jQuery method which sets and returns attributes and values of the selected elements.
        // In this case, it sets the src attribute to the URL.
        $("#poster").attr("src", "https://neo4j-documentation.github.io/developer-resources/language-guides/assets/posters/" + encodeURIComponent(movie.title) + ".jpg");

        // $list is just an arbitrarily-chosen name for a variable.
        // .empty() is a jQuery method which removes the contents of all the selected elements.
        const $list = $("#crew").empty();

        movie.cast.forEach(cast => {
        $list.append($("<li>" + cast.name + " " + cast.job + (cast.job === "acted" ? " as " + cast.role : "") + "</li>"));
        });

        $("#vote")
            .unbind("click")
            .click(function () {voteInMovie(movie.title) } )
    },
    "json");
}

function voteInMovie(title) {
  api.voteInMovie(title)
    .then(() => search(false))
    .then(() => showMovie(title));
}

function search(showFirst = true) {
  const query = $("#search").find("input[name=search]").val();
  api
    .searchMovies(query)
    .then(movies => {
      const t = $("table#results tbody").empty();

      if (movies) {
        movies.forEach((movie, index) => {
          $('<tr>' + 
              `<td class='movie'>${movie.title}</td>` + 
              `<td>${movie.released}</td>` +
              `<td>${movie.tagline}</td>` + 
              `<td id='votes${index}'>${movie.votes}</td>` +
            '</tr>')
            .appendTo(t)
            .click(function() {
              showMovie($(this).find("td.movie").text());
            })
        });

        const first = movies[0];
        if (first && showFirst) {
          return showMovie(first.title);
        }
      }
    });
}

function renderGraph() {
  const width = 800, height = 800;
  const force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  const svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      const link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      const node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
