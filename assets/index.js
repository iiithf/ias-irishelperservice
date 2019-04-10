const $plot = document.querySelector('#plot');
const REQUESTRATE = 500;
var plot = null;


function dataPlot(x, y) {
  var data = [{type: 'bar', name: 'Count', x, y}];
  if(plot) Plotly.deleteTraces('plot', 0);
  plot = Plotly.plot('plot', data, {}, {showSendToCloud: true});
}

async function onInterval() {
  var data = await m.request({method: 'GET', url: '/status'});
  var x = Object.keys(data).filter(k => k!=='time');
  var y = x.map(k => data[k]);
  dataPlot(x, y);
}
onInterval();
setInterval(onInterval, REQUESTRATE);
