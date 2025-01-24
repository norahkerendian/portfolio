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
