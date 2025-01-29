console.log("projects.js loaded!");
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('/portfolio/lib/projects.json');

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
    projectsTitle.innerHTML = `${projects.length} Projects`;
}

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

