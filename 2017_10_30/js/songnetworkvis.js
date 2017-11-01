function Network() {
  var allData = [],
      width = 960,
      height = 800,
      // our force directed layout
      force = d3.layout.force(), 
      // these will point to the circles and lines
      // of the nodes and links
      link = null,
      node = null,
      // these will hold the svg groups for
      // accessing the nodes and links display
      linksG = null,
      nodesG = null,
      // tooltip used to display details
      tooltip = Tooltip("vis-tooltip", 230),
      network; //function

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  function mapNodes(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function(n) {
      return nodesMap.set(n.id, n);
    });
    return nodesMap;
  }

  function setupData(data) {

    var circleRadius, countExtent;
    // initialize circle radius scale
    countExtent = d3.extent(data.nodes, function(d) {
     return d.playcount;
    });
    circleRadius = d3.scale.sqrt().range([3, 15]).domain(countExtent);

    //First let's randomly dispose data.nodes (x/y) within the the width/height
    // of the visualization and set a fixed radius for now
    data.nodes.forEach(function(n) {
      var randomnumber;
      // set initial x/y to values within the width/height
      // of the visualization
      n.x = randomnumber = Math.floor(Math.random() * width);
      n.y = randomnumber = Math.floor(Math.random() * height);
      // add radius to the node so we can use it later
      n.radius = circleRadius(n.playcount);

    });

    // Then we will create a map with
    // id's -> node objects
    // using the mapNodes function above and store it in the nodesMap variable.
    var nodesMap = mapNodes(data.nodes);
    
    // Then we will switch links to point to node objects instead of id's
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
    });

    // Finally we will return the data
    return data;
  }

  // Mouseover tooltip function
  function showDetails(d, i) {
    var content;
    content = '<p class="main">' + d.name + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">' + d.artist + '</span></p>';
    content += '<hr class="tooltip-hr">';
    content += '<p class="main">' + d.playcount + ' playcounts' + '</span></p>';
    tooltip.showTooltip(content, d3.event);

    // highlight the node being moused over
    return d3.select(this).style("stroke", "black").style("stroke-width", 2.0);
  }

  // Mouseout function
  function hideDetails(d, i) {
    tooltip.hideTooltip();
    // watch out - don't mess with node if search is currently matching
    node.style("stroke", function(n) {
    return "#555";
    }).style("stroke-width", function(n) {
    return 1.0;
    });
  }

  // enter/exit display for nodes
  function updateNodes() {
    //select all node elements in svg group of nodes
    node = nodesG.selectAll("circle.node")
      .data(allData.nodes, function(d) {
      return d.id;
    });
    
    // set cx, cy, r attributes and stroke-width style
    node.enter()
      .append("circle").attr("class", "node").attr("cx", function(d) {
        return d.x;})
      .attr("cy", function(d) {
        return d.y;})
      .attr("r", function(d) {
       return d.radius;})
      .style("stroke-width", 1.0);

    node.on("mouseover", showDetails).on("mouseout", hideDetails);
  }

  // enter/exit display for links
  function updateLinks() {
    //select all link elements in svg group of nodes
    link = linksG.selectAll("line.link")
      .data(allData.links, function(d) {
      return `${d.source.id}_${d.target.id}`; });
      link.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#ddd").attr("stroke-opacity", 0.8)
      .attr("x1", function(d) {
      return d.source.x; })
      .attr("y1", function(d) {
      return d.source.y; })
      .attr("x2", function(d) {
      return d.target.x; })
      .attr("y2", function(d) {
      return d.target.y; });
  }

  // tick function for force directed layout
  var forceTick = function(e) {
      node.attr("cx", function(d) {
        return d.x; })
        .attr("cy", function(d) {
        return d.y; });
        link.attr("x1", function(d) {
        return d.source.x; })
        .attr("y1", function(d) {
        return d.source.y; })
        .attr("x2", function(d) {
        return d.target.x; })
        .attr("y2", function(d) {
        return d.target.y;});
  };

  // Starting point for network visualization
  // Initializes visualization and starts force layout
  network = function(selection, data) {

    // format our data
    allData = setupData(data);

    // create our svg and groups
    vis = d3.select(selection).append("svg").attr("width", width).attr("height", height);
    linksG = vis.append("g").attr("id", "links");
    nodesG = vis.append("g").attr("id", "nodes");

    // setup the size of the force environment
    force.size([width, height]);

    // set the tick callback, charge and linkDistance

    // setup nodes and links
    force.nodes(allData.nodes);
    force.links(allData.links);

    updateNodes();
    updateLinks();

    force.on("tick", forceTick).charge(-200).linkDistance(50);

    // perform rendering and start force layout
    return force.start();
  };
  // Final act of Network() function is to return the inner 'network()' function.
  return network;
}
