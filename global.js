console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

//   currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/norahkerendian', title: 'GitHub' },
    { url: 'resume/', title: 'Resume' },
  ];
  
  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }

    if (a.host !== location.host) {
        a.target = '_blank';
    }
  }

document.body.insertAdjacentHTML(
'afterbegin',
`
<label class="color-scheme">
    Theme:
    <select>
    <option value="auto">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    </select>
</label>`
);

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    localStorage.colorScheme = colorScheme;
  }
  
const select = document.querySelector(".color-scheme select");
  
if (localStorage.colorScheme) {
    setColorScheme(localStorage.colorScheme); 
    select.value = localStorage.colorScheme; 
  } else {
    setColorScheme('auto'); 
    select.value = 'auto'; 
  }

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    setColorScheme(event.target.value);
  });


const form = document.querySelector("form[action='mailto:nokerendian@ucsd.edu']");

form?.addEventListener('submit', function (event) {
    event.preventDefault();

    let data = new FormData(form);
    let url = form.action + '?';

    for (let [name, value] of data) {
        console.log(name, encodeURIComponent(value));
        url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    }

    location.href = url;
});

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      console.log(url)
      const response = await fetch(url);
      if (!response.ok) {
        console.log('response')
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
        
    }
      const data = await response.json();
      return data; 


  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

fetchJSON('/portfolio/lib/projects.json').then(data => console.log(data));
console.log(window.location.href);
export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  project.forEach(project => {
      const article = document.createElement('article');
      article.innerHTML = `
          <${headingLevel}>${project.title}</${headingLevel}>
          <img src="${project.image}" alt="${project.title}">
          <p>${project.description}</p>
      `;
      containerElement.appendChild(article);
  });

}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}