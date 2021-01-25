const app     = require('express')();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);
const next    = require('next');

const dev         = process.env.NODE_ENV !== 'production';
const nextApp     = next({ dev })
const nextHandler = nextApp.getRequestHandler()
const PORT        = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log("> Connected succesfully to the socket ...");
  
  socket.emit('message', 'Hello from socket.io');
  socket.on('message', (data) => {
    console.log(data);
  });
});

nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`)
  })  
})