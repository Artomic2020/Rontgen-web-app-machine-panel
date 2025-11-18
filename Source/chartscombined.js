// Combined charts + gauges

// -----------------------------
// Gauge color settings
// -----------------------------
const colorBg = '#2d373d';
const colorNegative = '#e0242a';
const colorPositive = '#23a64e';

// -----------------------------
// Common gauge options
// -----------------------------
const gaugeOptions = {
  chart: {
    type: 'gauge',
    plotBackgroundColor: null,
    plotBackgroundImage: null,
    plotBorderWidth: 0,
    plotShadow: false,
    backgroundColor: colorBg
  },
  exporting: { enabled: false },
  title: { text: '' },
  legend: { enabled: false },
  tooltip: { enabled: false },
  credits: { enabled: false },
  pane: {
    startAngle: -97,
    endAngle: 97,
    background: [{ backgroundColor: colorBg, borderWidth: 0, shape: 'arc' }],
    size: '100%'
  },
  plotOptions: {
    gauge: {
      borderWidth: 20,
      dial: {
        radius: '72%',
        backgroundColor: '#fff',
        borderWidth: 0,
        baseWidth: 2,
        topWidth: 2,
        baseLength: '100%',
        rearLength: 0
      },
      pivot: { radius: 0 }
    }
  },
  yAxis: {
    min: -2.5,
    max: 102.5,
    lineWidth: 0,
    minorTickInterval: 2.5,
    minorTickWidth: 2,
    minorTickLength: 18,
    minorTickPosition: 'inside',
    minorTickColor: colorBg,
    tickWidth: 2,
    tickPosition: 'inside',
    tickLength: 18,
    tickColor: colorBg,
    labels: { enabled: false },
    title: { text: '' }
  }
};

// -----------------------------
// Gauge definitions
// -----------------------------
const gauges = [
  {
    id: 'gauge',
    data: [34.8189],
    plotBands: [
      { from: 0, to: 34.81, color: '#fff', thickness: 18 },
      { from: 34.82, to: 100, color: '#62696e', thickness: 18 }
    ]
  },
  {
    id: 'gauge2',
    data: [-1.5],
    plotBands: [
      { from: -2.5, to: 0, color: colorNegative, thickness: 18 },
      { from: 0, to: 100, color: '#62696e', thickness: 18 }
    ]
  },
  {
    id: 'gauge3',
    data: [101.5],
    plotBands: [
      { from: 0, to: 100, color: '#fff', thickness: 18 },
      { from: 100, to: 102.5, color: colorPositive, thickness: 18 }
    ]
  }
];

// -----------------------------
// Initialize charts after DOM
// -----------------------------
document.addEventListener('DOMContentLoaded', function () {
/*1️⃣ Main chart (future integration)
  const mainContainer = document.getElementById('container');
  if (mainContainer) {
    Highcharts.chart('container', {
      chart: { type: 'spline' },
      title: { text: 'Most common desktop screen readers' },
      subtitle: { text: 'Source: WebAIM. Click on points to visit official screen reader website' },
      legend: { symbolWidth: 40 },
      credits: { enabled: false },
      yAxis: { title: { text: 'Percentage usage' }, accessibility: { description: 'Percentage usage' } },
      xAxis: {
        title: { text: 'Time' },
        accessibility: { description: 'Time from December 2010 to September 2019' },
        categories: ['December 2010', 'May 2012', 'January 2014', 'July 2015', 'October 2017', 'September 2019']
      },
      tooltip: { valueSuffix: '%', stickOnContact: true },
      plotOptions: {
        series: {
          point: { events: { click: function () { window.location.href = this.series.options.website; } } },
          cursor: 'pointer'
        }
      },
      series: [], // Empty for now, fill later
      responsive: { rules: [] } // Optional
    });
  }*/

  // 2️⃣ Gauges
  gauges.forEach(g => {
    const container = document.getElementById(g.id);

    if (container && g.data?.length && container.offsetWidth > 0 && !container.seriesInitialized) {
      Highcharts.chart(g.id, Highcharts.merge(gaugeOptions, {
        yAxis: { plotBands: g.plotBands },
        series: [{ data: g.data, borderWidth: 2, dataLabels: { enabled: false } }],
        accessibility: { enabled: false }
      }));

      container.seriesInitialized = true;
    }
  });
});
