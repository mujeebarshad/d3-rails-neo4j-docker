// Deals specifically with UI of CMDB
var svgDimensions = d3.select("#graph_relationships").node().getBoundingClientRect();
var margin = { top: 50, right: 120, bottom: 50, left: 120 },
  width = svgDimensions.width - 5;
  height = window.innerHeight - 100
var ICON_COLOR = '#969696';
var CIRCLE_COLOR = '#EFEFEF';
var TEXT_COLOR = '#198774';
var COLLAPSE_COLOR = '#198754';
var simulation, node, nodeRel, nodeIcon, nodeText, nodeRect, link;

var CONTROLLER_PATH = { 'category': 'categories', 'product': 'products', 'variant': 'variants' };
var data;

var radius = 20;

var svg = d3.select("#graph_relationships").append("svg")
.attr("width", width)
.attr("height", height);


var zoom_handler = d3.zoom()
.on("zoom", zoom_actions)
.on('end', function(){d3.selectAll('svg').attr('cursor', 'default')});

d3.select("#zoom_in").on("click", function () {
  zoom_handler.scaleBy(svg.transition().duration(750), 1.2);
});

d3.select("#zoom_out").on("click", function () {
  zoom_handler.scaleBy(svg.transition().duration(750), 0.8);
});

d3.select("#reset_zoom").on("click", function () {
  svg.transition().duration(750).call(zoom_handler.transform, d3.zoomIdentity);
});

function update(data){
  simulation = d3.forceSimulation(data.nodes.filter(n => n.show))
    .force("link", d3.forceLink(data.links.filter(n => n.show)).id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-4000))
    .force("center", d3.forceCenter(width / 2, (height) / 2))
    .force("x", d3.forceX(width / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1))
    .on("tick", ticked);

  svg.append("svg:defs").selectAll("marker")
  .data(["end"])
  .enter().append("svg:marker")
  .attr("id", String)
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 35)
  .attr("refY", 0)
  .attr("markerWidth", 4)
  .attr("markerHeight",42)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5")
  .style('fill', ICON_COLOR);

  link = svg.append("g")
  .selectAll("line")
  .data(data.links.filter(n => n.show))
  .enter()
  .append("line")
  .attr("stroke-width",2)
  .attr('class', 'cmdb_element')
  .attr('id', function(d) { return `line_${d.source.id}`; })
  .attr("marker-end", "url(#end)")
  .style('stroke', ICON_COLOR);

  nodeRel = svg.append("g")
  .selectAll("text")
  .data(data.links.filter(n => n.show))
  .enter()
  .append("text")
  .attr('font-size', '12px')
  .attr('class', 'cmdb_element')
  .attr('visibility', 'hidden')
  .attr('id', function(d) { return `relation_${d.source.id}`; })
  .text(function(d) { return d.relationship_name; });

  node = svg.append("g")
  .selectAll("circle")
  .data(data.nodes.filter(n => n.show))
  .enter()
  .append("circle")
  .attr("r", radius)
  .attr("fill", function(d) { return determineColor(d, CIRCLE_COLOR, COLLAPSE_COLOR) })
  .attr('class', 'cmdb_element')
  .attr('cursor', 'pointer')
  .attr('id', function(d){ return `circle_${d.id}` })
  .style('stroke', function(d) { return determineColor(d, ICON_COLOR, TEXT_COLOR) })
  .on("mouseover", function() {
    d3.selectAll(`#relation_${this.__data__.id}`).style('visibility', 'visible');
  d3.selectAll(`#line_${this.__data__.id}`).style('stroke', TEXT_COLOR);
      })
  .on("mouseout", function(){
    nodeRel.style("visibility", "hidden");
  d3.selectAll(`#line_${this.__data__.id}`).style('stroke', ICON_COLOR);
      })
  .on('click', function(){toggleChildren(this.__data__)});

  nodeIcon = svg.append("g")
  .selectAll("text")
  .data(data.nodes.filter(n => n.show))
  .enter()
  .append("text")
  .attr("text-anchor", 'middle')
  .attr("class", "fas cmdb_element")
  .attr('font-size', '20px')
  .attr('cursor', 'move')
  .attr('fill', function(d) { return determineColor(d, ICON_COLOR, CIRCLE_COLOR) })
  .text(function(d) { return String.fromCodePoint(parseInt(d.icon, 16))})
  .on("mouseover", function() {
    d3.selectAll(`#relation_${this.__data__.id}`).style('visibility', 'visible');
  d3.selectAll(`#line_${this.__data__.id}`).style('stroke', TEXT_COLOR)
        })
  .on("mouseout", function(){
    nodeRel.style("visibility", "hidden");
  d3.selectAll(`#line_${this.__data__.id}`).style('stroke', ICON_COLOR);
        })
  .on('click', function(d){toggleChildren(this.__data__)});

  nodeRect = svg.append("g")
  .selectAll("rect")
        .data(data.nodes.filter(n => n.show))
  .enter()
  .append("rect")
  .attr("height", '20px')
  .attr('width', function(d) { return (d.id.length + 1.5) * 10 })
  .attr('rx', '5px')
  .attr('fill', CIRCLE_COLOR)
  .attr('class', 'cmdb_element')
  .style("stroke", ICON_COLOR);;

  nodeText = svg.append("g")
  .selectAll("text")
  .data(data.nodes.filter(n => n.show))
  .enter()
  .append("text")
  .attr("class","fas cmdb_element")
  .attr('font-size', '15px')
  .attr('cursor', 'pointer')
  .attr('id', function(d){ return `text_${d.id}` })
  .style('fill', TEXT_COLOR)
  .text(function(d) { return getNodeName(d) })

  nodePlus = svg.append("g")
  .selectAll("text")
  .data(data.nodes.filter(n => n.show))
  .enter()
  .append("text")
  .attr("class","fas cmdb_element")
  .attr('font-size', '15px')
  .attr('cursor', 'pointer')
  .attr('id', function(d){ return `plus_${d.id}` })
  .style('fill', TEXT_COLOR)
  .text(function(d) { return '' })

  // Calculate width of rectangle
  nodeRect
  .attr('width', function(d) { return d3.select(`#text_${d.id}`).node().getComputedTextLength() + 5 });

  var drag_handler = d3.drag()
  .container(nodeIcon.node())
  .subject(dragsubject)
  .on('start', dragstarted)
  .on('drag', dragged)
  .on('end', dragended);

  drag_handler(nodeIcon);

  zoom_handler(svg);
}

function zoom_actions(event){
  d3.selectAll('svg').attr('cursor', 'move');
  //To ignore the in app 'g' nodes list
  d3.selectAll('g').filter(function(d) { return this.childNodes.length > 0 && this.childNodes[0].className != undefined && this.childNodes[0].className.baseVal.indexOf('cmdb_element') !== -1 }).attr("transform", event.transform);
}

function ticked() {
  link.attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  node.attr("cx", function(d) {return d.x;})
  .attr("cy", function(d) {return d.y;});

  nodeIcon.attr("dx", function(d) {return d.x;})
  .attr("dy", function(d) {return d.y + 5;});

  nodeText.attr("dx", function(d) {return (d.x - d.id.length) - 18;}) // Adjusted with Rectangle
  .attr("dy", function(d) {return d.y + 37;});

  nodePlus.attr("dx", function(d) { return (d.x + d3.select(`#text_${d.id}`).node().getComputedTextLength() - 25);}) // Adjusted with Rectangle
  .attr("dy", function(d) {return d.y + 37;});

  nodeRect.attr("x", function(d) {return (d.x - d.id.length) - 20;}) // As per radius of circle
  .attr("y", function(d) {return d.y + 22;});

  nodeRel.attr("transform", function(d) {
      var angle = Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180 / Math.PI;
  return 'translate(' + [((d.source.x + d.target.x) / 2), ((d.source.y + d.target.y) / 2)] + ')rotate(' + angle + ')';
    });
}

function dragsubject(event) {
  return simulation.find(event.x, event.y, radius);
}

function drawNode(d) {
  ctx.fillStyle = color(d.party)
  ctx.moveTo(d.x, d.y)
  ctx.arc(d.x, d.y, radius, 0, Math.PI * 2)
}

function drawLink(ele) {
  ctx.moveTo(ele.source.x, ele.source.y)
  ctx.lineTo(ele.target.x, ele.target.y)
}

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

// Toggle children on click.
function toggleChildren(d) {
  if (d.showChildren)
  {
    toggleVisibilityOfNodesAndLinks(d.id, false);
    d.showChildren = false;
  }
  else
  {
    if (!d.cache) {
      fetch_relationships(d.id);
      d.cache = true;
    }
    toggleVisibilityOfNodesAndLinks(d.id, true);
    d.showChildren = true;
  }

  updateNetwork();
  update(data);
}

function determineColor(element, baseColor, updatedColor){
  if (element.showChildren || !element.hasChildren){
    return baseColor;
  }
  else{
    return updatedColor;
  }
}

function updateNetwork(){
  svg.selectAll('circle').remove();
  svg.selectAll('line').remove();
  svg.selectAll('text').remove();
  svg.selectAll('rect').remove();
  svg.selectAll('marker').remove();
}

function toggleVisibilityOfNodesAndLinks(d, visibility){
  const parents = [d];
  let loopCount = 0;
  let visited = [];
  while (parents.length > 0) {
    const parent = parents.shift();
    visited.push(parent);
    data.links.forEach(data_link => {
      if ((data_link.source.id || data_link.source) === parent) {
        data_link.show = visibility;
        if(data_link.target && data_link.target.hasChildren && !data_link.target.showChildren) data_link.target.show = visibility;

        if (visited.indexOf(data_link.target.id || data_link.target) === -1 && (data_link.target.show !== visibility))
        {
          parents.push(data_link.target.id || data_link.target); 
        }
      }
    });
    data.nodes.forEach(node => {
    if (node.id === parent && loopCount !== 0) {
      node.show = visibility;
        data.links.forEach(data_link => ((data_link.target.id || data_link.target) == node.id && data_link.source.showChildren == true) ? data_link.show = visibility : data_link.show);
      }
    });
    loopCount += 1;
  }
};

function fetch_relationships(element) {
  var typeId = element.split("_");
  var id = typeId[0];
  var type = typeId[1].toLowerCase();

  $.ajax({
    type: 'GET',
    async: false,
    url: `/${CONTROLLER_PATH[type]}/${id}.json`,
    dataType: 'json',
    success: function (result) {
      debugger
      if (result.nodes.length > 0) data.nodes = data.nodes.concat(...removeExistingNodes(data.nodes, result.nodes));
      if (result.links.length > 0) data.links = data.links.concat(...removeExistingLinks(data.links, result.links));
    }
  });

}

function removeExistingNodes(oldNodes, newNodes){
  uniqueNodes = [];
  for(var i = 0; i < newNodes.length; i++){
    var flag = false;
    for(var j = 0; j < oldNodes.length; j++){
      if(oldNodes[j].id === newNodes[i].id){
        flag = true;
        break;
      }
    }
    if(!flag) uniqueNodes.push(newNodes[i]);
    flag = false;
  }
  return uniqueNodes;
}

function removeExistingLinks(oldLinks, newLinks){
  uniqueLinks = [];
  for(var i = 0; i < newLinks.length; i++){
    var flag = false;
    for(var j = 0; j < oldLinks.length; j++){
      if(oldLinks[j].source.id === newLinks[i].source && oldLinks[j].target.id === newLinks[i].target && oldLinks[j].relationship_name === newLinks[i].relationship_name){
        flag = true;
        break;
      }
    }
    if(!flag) uniqueLinks.push(newLinks[i]);
    flag = false;
  }
  return uniqueLinks;
}

function getNodeName(node){
  return node.name;
}

function generate_graph_view(networkData) {
  data = networkData;
  update(data);
}

var networkData = document.querySelector('#graph_relationships').dataset.nodesLinks.replaceAll('&quot;', '"');
networkData = JSON.parse(networkData);

generate_graph_view(networkData)

// Events
$(document).ready(function () {
  $('[data-bs-toggle="popover"]').popover();
});