async function get_covid_data(){
    let covid_url = "https://corona.lmao.ninja/v2/historical/Japan?lastdays=60"
    let covid_response = await fetch(covid_url);
    let covid_data = await covid_response.json();
    return covid_data;
};

  // Utility function to get time in a time-zone
  function format_date(s){
    let t = new Date(s);
    return t.toLocaleString('it-IT', { dateStyle: 'short' });
  };

get_covid_data().then(function(covid_data){
var ctx2 = document.getElementById("chart-line").getContext("2d");

    var gradientStroke1 = ctx2.createLinearGradient(0, 230, 0, 50);

    gradientStroke1.addColorStop(1, '#8B2030');
    gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); //purple colors

    var gradientStroke2 = ctx2.createLinearGradient(0, 230, 0, 50);

    gradientStroke2.addColorStop(1, '#6BA368');
    gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

    let dates = Object.keys(covid_data.timeline.cases).map(x => format_date(x));
    let cases = Object.values(covid_data.timeline.cases);
    let deaths = Object.values(covid_data.timeline.deaths);

    dates.shift();

    let daily_cases = []
    let daily_deaths = []

    cases.forEach(function(value, index, self){
      if (index != 0) {
        daily_cases.push(value - self[index-1]);
      }
    });
    deaths.forEach(function(value, index, self){
      if (index != 0) {
        daily_deaths.push(value - self[index-1]);
      }
    });

    new Chart(ctx2, {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
            label: "Cases",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#8B2030",
            borderWidth: 3,
            backgroundColor: gradientStroke1,
            fill: true,
            data: daily_cases,
            maxBarThickness: 6

          },
          {
            label: "Deaths",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#6BA368",
            borderWidth: 3,
            backgroundColor: gradientStroke2,
            fill: true,
            data: daily_deaths,
            maxBarThickness: 6
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              padding: 10,
              color: '#b2b9bf',
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              color: '#b2b9bf',
              padding: 20,
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
        },
      },
    });
})
