const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
let starttimevalue,interval,prevclose,prevhigh,prevlow,prevopen
let timeinterval = 1000

let i = 1;
let intervalId

function startInterval() {
  intervalId = setInterval(() => {
    if (starttimevalue && interval && prevopen && prevhigh && prevlow && prevclose) {
      const liveData = {
        time: starttimevalue + i * interval,
        open: parseFloat((prevopen + (Math.random() - 0.5) * 0.2).toFixed(3)),
        high: parseFloat((prevhigh + (Math.random() - 0.5) * 0.2).toFixed(3)),
        low: parseFloat((prevlow + (Math.random() - 0.5) * 0.2).toFixed(3)),
        close: parseFloat((prevclose + (Math.random() - 0.5) * 0.2).toFixed(3))
      };

      io.emit('liveData', liveData);
      i++;
    } 
  }, timeinterval);
}


io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  socket.on('updatedata',(data)=>{
    starttimevalue = data[0].time
    interval = (data[0].time-data[1].time)
    timeinterval=interval*1000
    prevopen = data[0].open
    prevhigh = data[0].high
    prevlow = data[0].low
    prevclose = data[0].close
    clearInterval(intervalId)
    startInterval()
  })
});

startInterval();


const port = process.env.PORT || 4001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
