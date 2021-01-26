const app     = require('express')();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);
const next    = require('next');

const { Client }  = require('whatsapp-web.js');
const dev         = process.env.NODE_ENV !== 'production';
const nextApp     = next({ dev })
const nextHandler = nextApp.getRequestHandler()
const PORT        = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('> Connected succesfully to the socket ...');
  socket.emit('message', 'Hello from socket.io');

  socket.on('message', (data) => {
    console.log(data);
    const client        = new Client({
        puppeteer: { args: ['--no-sandbox'] }
    });
    client.on('qr', (qr) => {
        console.log('> QR RECEIVED', qr);
        socket.emit('message', {
            action: 'qr',
            status: false,
            statusMsg: 'QR Code generated',
            data: qr
        });
    });
    client.on('ready', () => {
        console.log('> Client is ready!');
        socket.emit('message', {
            action: 'ready',
            status: false,
            statusMsg: 'Client ready',
            data: data
        });
    });
    client.initialize().catch((error) => {
        console.log('> ', error);
    });
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