const app         = require('express')();
const bodyParser  = require('body-parser');
const server      = require('http').createServer(app);
const io          = require('socket.io')(server);
const next        = require('next');

const controller  = require('./controllers');
const loader      = require('./loaders');

const { Client, MessageMedia }  = require('whatsapp-web.js');
const dev         = process.env.NODE_ENV !== 'production';
const nextApp     = next({ dev });
const nextHandler = nextApp.getRequestHandler();
const PORT        = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
            loader: true,
            statusMsg: 'QR Code generated',
            data: qr
        });
    });

    client.on('ready', () => {
        console.log('> Client is ready!');
        socket.emit('message', {
            action: 'ready',
            loader: true,
            statusMsg: 'Client ready',
            data: data
        });

        if (data.message && data.rows.length) {
          Promise.all(data.rows.map((item, index) => {
            return new Promise((resolve) => {
              const numFilter = String(item['Nomor HP']).match(/8[0-9]+$/g);
              const number  = numFilter ? `62${numFilter}` : null;
              const message = data.message.replace('#name', item['Nama Panggilan']);

              setTimeout(async () => {
                socket.emit('message', {
                  action: 'progress',
                  loader: true,
                  statusMsg: `Progress ${index+1} dari ${data.rows.length}`,
                  data: item
                });

                console.log(number);

                if (number) {

                	if (String(number).startsWith('62')) {

                		if (data.image_data && data.image_ext) {
                      const media     = new MessageMedia(`image/${data.image_ext}`, data.image_data);
                      await client.sendMessage(`${number}@c.us`, media).catch((error) => {
                        console.log(error);
                      });
	                  }

                    client.sendMessage(`${number}@c.us`, message)
                    .then(() => {
                      resolve({
                          ... item,
                          status: true
                      });
                    })
                    .catch((error) => {
                      resolve({
                          ... item,
                          status: false,
                          message: error
                      });
                    });

                	} else {
                		resolve({
                      ... item,
                      status: false,
                      message: 'error number'
                    });
                	}
                  
                } else {
                  resolve({
                      ... item,
                      status: false,
                      message: 'no number'
                  });
                }
              }, index*3000);
            });
          }))
          .then((result) => {
            socket.emit('message', {
              action: 'done',
              loader: false,
              statusMsg: 'Message sent',
              data: result
            });
          })
          .catch((error) => {
            console.log(`> Error: `, error);
            socket.emit('message', {
              action: 'done',
              status: true,
              statusMsg: `Error ${error}`,
              data: data
            });
          });
        } else {
          socket.emit('message', {
            action: 'done',
            status: true,
            statusMsg: 'Invalid message and rows',
            data: data
          });
        }
    });

    client.initialize().catch((error) => {
        console.log('> Error: ', error);
    });

  });

});

nextApp.prepare().then(async () => {
  await loader();

  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  app.post('/login', (req, res) => {
    controller.user.login(req, res);
  });

  app.post('/register', (req, res) => {
    controller.user.register(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`)
  });  
})