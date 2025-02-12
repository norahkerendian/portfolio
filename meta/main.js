let data = [];
let commits = [];
let xScale;
let yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats();
    console.log(commits);
  }

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          configurable: false,
          writable: false,
          enumerable: false,
        });
  
        return ret;
      });
  }

// document.addEventListener('DOMContentLoaded', async () => {
//     await loadData();
//     createScatterplot();
//     brushSelector();
// });

function displayStats() {
    processCommits();
  
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    const avgLineLength = d3.mean(data, d => d.length);
    dl.append('dt').text('Average line length (characters)');
    dl.append('dd').text(avgLineLength.toFixed(2)); 

    const longestLineLength = d3.max(data, d => d.length);
    dl.append('dt').text('Longest line length (characters)');
    dl.append('dd').text(longestLineLength);
    
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => {
        const hour = d.datetime.getHours();
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
        }
    );
    
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Time of day that most work is done');
    dl.append('dd').text(maxPeriod);
  }

// step 2
function createScatterplot() {
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const width = 1000; // 1000
    const height = 600; // 600
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    const colorScale = d3.scaleLinear()
    .domain([0, 6, 12, 18, 24]) 
    .range(["#1E3A8A", "#3B82F6", "#FDBA74", "#F97316", "#1E3A8A"]); 

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width))
        .selectAll("line")
        .style("stroke", (d) => colorScale(d))
        .style("stroke-opacity", 0.6) 
        .style("stroke-width", 1.5);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    const dots = svg.append('g').attr('class', 'dots');
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 30]); 

    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity', 0.7) 
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1); 
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7); 
            updateTooltipContent({}); 
            updateTooltipVisibility(false);
        });
}

// step 3

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines-edited');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// step 5

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();

    // sanity check
    if (!event.selection) return; 
    //  if there's a selection element
        const [[x0, y0], [x1, y1]] = event.selection;
        console.log('Brushed area:', x0, y0, x1, y1);
}

function isCommitSelected(commit) {
    if (!brushSelection) {
      return false;
    }
    // TODO: return true if commit is within brushSelection and false if not

    // const [x0, y0] = brushSelection[0];
    // const [x1, y1] = brushSelection[1];

    // const x = xScale(commit.datetime);
    // const y = yScale(commit.hourFrac);

    // return x >= x0 && x <= x1 && y >= y0 && y <= y1;

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] }; 
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] }; 
    const x = xScale(commit.date); 
    const y = yScale(commit.hourFrac); 
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}
  
function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            `;
    }

    return breakdown;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
    brushSelector();
});