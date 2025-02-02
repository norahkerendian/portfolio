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
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let sliceGenerator = d3.pie().value((d) => d.value);

function renderPieChart(data) {
    let rolledData = d3.rollups(
        data,
        (v) => v.length,
        (d) => d.year
    );

    let chartData = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcData = sliceGenerator(chartData);
    let arcs = arcData.map((d) => arcGenerator(d));

    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    arcs.forEach((arc, idx) => {
        d3.select('svg')
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(idx));
    });

    let legend = d3.select('.legend');
    chartData.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

let query = '';
let filteredProjects = projects;

function setQuery(newQuery) {
    query = newQuery;
    filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join(' ').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    return filteredProjects;
}

let searchInput = document.getElementsByClassName('searchBar')[0];

searchInput.addEventListener('input', (event) => {
    let updatedProjects = setQuery(event.target.value);
    renderProjects(updatedProjects, projectsContainer, 'h2');
    
    renderPieChart(updatedProjects);
});
