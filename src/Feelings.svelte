<script context="module">
  let g;
  let root;
  export let feelingsIds = [];
  export function currentFeelings() {
    var values = [];
    g.selectAll('g')
      .data(root.descendants())
      .each(function (d) {
        let id = d.data.id;
        if (id) {
          const selNode = this;
          if (selNode.classList.contains("selected")) {
            console.log(id);
            values.push(1);
          } else {
            values.push(0);
          }
        }
      });
    return values;
  }

  export function setFeelings(line) {
    var j = 2;
    g.selectAll('g')
      .data(root.descendants())
      .each(function (d) {
        let id = d.data.id;
        if (id) {
          var selNode = this;
          console.log(selNode);
          if (line[j] == '0') {
            selNode.classList.remove("selected")
          } else {
            selNode.classList.add("selected")
          }
          j += 1;
        }
      });
  }
</script>

<script>
  import feelings from './feelings.ts';
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let width = 900;
  let height = 900;
  let bandSize = 150;
  let radius = Math.min(width, height) / 2;

  /**
   * Calculate the correct distance to rotate each label based on its location in the sunburst.
   * @param {Node} d
   * @return {Number}
   */
  function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;
    return (angle < 180) ? angle - 90 : angle + 90;
  }

  onMount(() => {
    // Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
    g = d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Create our sunburst data structure and size it.
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);

    // Find the root node of our data, and begin sizing process.
    root = d3.hierarchy(feelings)
        .sum(function (d) { return d.size});

    // Calculate the sizes of each arc that we'll draw later.
    partition(root);
    var arc = d3.arc()
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1})
        .innerRadius(function (d) { return d.depth == 0 ? 0 : (d.depth -1) * bandSize })
        .outerRadius(function (d) { return d.depth == 0 ? 0 : d.depth * bandSize });

    // Add a <g> element for each node in the data, then append <path> elements and draw lines based on the arc
    // variable calculations. Last, color the lines and the slices.
    g.selectAll('g')
      .data(root.descendants())
      .enter().append('g').attr("class", "node")
      .attr("id", function (d) { return d.data.id; })
      .append('path')
      .attr("display", function (d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .style("stroke", "black")
      .style("fill", function (d) { return d.data.color; })
      .each(function (d) {
        var id = d.data.id;
        var selNode = this.parentNode;
        selNode.addEventListener('click', function(e) {
          selNode.classList.toggle('selected');
        });
      });

    // Populate the <text> elements with our data-driven titles.
    g.selectAll(".node")
      .append("text")
      .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
      .attr("dy", ".5em") // rotation align
      .text(function(d) { return d.parent ? d.data.name : "" })
      .style("text-anchor", "middle")
      .attr("fill", function (d) { return d.data.text; });

    g.attr("transform", "rotate(45)")
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    feelingsIds = [];
    g.selectAll('g')
      .data(root.descendants())
      .each(function (d) {
        let id = d.data.id;
        if (id) {
          feelingsIds.push(id)
        }
      })
  });
</script>

<svg></svg>

<style>
:global(.selected) {
  font-weight: bold;
}
</style>
