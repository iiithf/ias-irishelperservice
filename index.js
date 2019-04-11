const express = require('express');
const needle = require('needle');
const http = require('http');
const path = require('path');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const ASSETS = path.join(__dirname, 'assets');
const SOURCE = E['SOURCE']||'';
const DATARATE = parseInt(E['DATARATE']||'500', 10);
const app = express();
const server = http.createServer(app);
const counts = {time: new Date(), setosa: 0, versicolor: 0, virginica: 0};



function onData(data) {
  var {flower} = data;
  counts[flower]++;
  counts.time = new Date();
  return counts;
}

async function onInterval() {
  if(!SOURCE) return;
  var res = await needle('get', SOURCE);
  console.log('SOURCE', SOURCE, res.body);
  console.log('counts', onData(res.body));
}
setInterval(onInterval, DATARATE);



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body, req.query);
  var {ip, method, url, body} = req;
  if(method!=='GET') console.log(ip, method, url, body);
  next();
});

app.get('/status', (req, res) => {
  res.json(counts);
});
app.post('/status', (req, res) => {
  res.json(onData(req.body));
});

app.use(express.static(ASSETS, {extensions: ['html']}));
app.use((err, req, res, next) => {
  console.log(err, err.stack);
  res.status(err.statusCode||500).send(err.json||err);
});
server.listen(PORT, () => {
  console.log('IRISHELPERSERVICE running on '+PORT);
});
