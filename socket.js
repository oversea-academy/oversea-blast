const helper      = require('./helpers');
const socketio    = require('socket.io');
const { Client, MessageMedia }  = require('whatsapp-web.js');

module.exports = (server) => {
  const io          = socketio(server);

  io.on('connection', (socket) => {
    socket.on('message', (data) => {
      console.log(`> Message ${data.message} with rows ${data.rows.length} mode ${data.mode}`);
      const client        = new Client({
          puppeteer: { args: ['--no-sandbox'] }
      });
  
      client.on('qr', (qr) => {
          console.log('> QR RECEIVED', qr);
          socket.emit('message', {
              action: 'qr',
              loader: true,
              statusMsg: 'QR Code generated, please scan',
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
              return new Promise(async (resolve) => {
                const numFilter = String(item['Nomor HP']).match(/8[0-9]+$/g);
                const number    = numFilter ? `62${numFilter}` : null;
                const message   = await helper.replaceMessage(data.message, item, data.mode);
  
                setTimeout(async () => {
                  socket.emit('message', {
                    action: 'progress',
                    loader: true,
                    statusMsg: `Progress ${index+1} dari ${data.rows.length}`,
                    data: item
                  });
  
                  if (number) {
                    if (String(number).startsWith('62')) {
                      if (data.image_data && data.image_ext) {
                        const media     = new MessageMedia(`image/${data.image_ext}`, data.image_data);
                        await client.sendMessage(`${number}@c.us`, media, {
                          media: true
                        })
                        .then((res) => {
                          console.log(res);
                        })
                        .catch((error) => {
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

              setTimeout(async () => {
                await client.logout();
              }, 1000);
            })
            .catch((error) => {
              console.log(`> Error: `, error);
              socket.emit('message', {
                action: 'done',
                status: true,
                statusMsg: `Error ${error}`,
                data: data
              });
              setTimeout(async () => {
                await client.logout();
              }, 1000);
            });
          } else {
            socket.emit('message', {
              action: 'done',
              status: true,
              statusMsg: 'Invalid message and rows',
              data: data
            });
            setTimeout(async () => {
              await client.logout();
            }, 1000);
          }
      });

      client.on('disconnected', (reason) => {
        console.log('> Client was logged out by', reason);
      });
  
      client.initialize().catch((error) => {
          console.log('> Error: ', error);
      });
  
    });
  
  });
}