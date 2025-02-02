console.log("projects.js loaded!");

import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
    projectsTitle.innerHTML = `${projects.length} Projects`;
}

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

let data = [1, 2, 3, 4, 5, 5];
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) 
})