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