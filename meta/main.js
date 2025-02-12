let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
});

function displayStats() {
    processCommits();
  
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Add more stats as needed...

    // average line length
    const avgLineLength = d3.mean(data, d => d.length);
    dl.append('dt').text('Average line length (characters)');
    dl.append('dd').text(avgLineLength.toFixed(2)); // round to 2 decimals

    // longest line length
    const longestLineLength = d3.max(data, d => d.length);
    dl.append('dt').text('Longest line length (characters)');
    dl.append('dd').text(longestLineLength);
    
    // Calculate time of day when most work is done
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
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    // gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const colorScale = d3.scaleLinear()
    .domain([0, 6, 12, 18, 24]) 
    .range(["#1E3A8A", "#3B82F6", "#FDBA74", "#F97316", "#1E3A8A"]); 

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width))
        .selectAll("line")
        .style("stroke", (d) => colorScale(d))
        .style("stroke-opacity", 0.6) 
        .style("stroke-width", 1.5);

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
          })
          .on('mouseleave', () => {
            updateTooltipContent({}); // Clear tooltip content
            updateTooltipVisibility(false);
          });
}

// step 3

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    // const time = document.getElementById('commit-time');
    // const author = document.getElementById('commit-author');
    // const lines = document.getElementById('commit-lines-edited');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  }

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

