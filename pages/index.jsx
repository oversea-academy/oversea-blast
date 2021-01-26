import Head   from 'next/head';
import styles from '../styles/Home.module.css';
import io     from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import xlsx   from 'xlsx';
import QRCode from 'qrcode';

export default function Home() {
  const [socket, setSocket]       = useState(io());
  const [message, setMessage]     = useState("");
  const [file, setFile]           = useState(React.createRef());
  const [fileName, setFileName]   = useState(null);
  const [dataExcel, setDataExcel] = useState([]);

  function executeMessage(e) {
    e.preventDefault();
    const data = {
      message,
      data: dataExcel
    }
    renderQRCode(message);
    socket.emit("message", JSON.stringify(data));
  }

  function handleFile(e) {
    e.preventDefault();
    const name = file.current.files[0].name;
    const ext = name.split(".")[1]
    if ( ext == 'xlsx' || ext == 'csv' ) {
      setFileName(file.current.files[0].name);
      convertExcel(file.current.files[0]);
    } else {
      alert('File format is not valid')
    }
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  function convertExcel(fileExcel) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const data      = e.target.result;
      const workbook  = xlsx.read(data, {
        type: 'binary'
      });
      const sheet_name_list = workbook.SheetNames;
      const content = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      setDataExcel(content);
    };

    reader.onerror = function(ex) {
      console.log(ex);
    };
    reader.readAsBinaryString(fileExcel);
  }

  function renderQRCode(data) {
    const canvas = document.getElementById('canvas');
    QRCode.toCanvas(canvas, data, function (error) {
      if (error) {
        console.error(error) 
      } else {
        console.log('success!');
      }
    });
  }

  function clearQRCode() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        console.log(data);
      });
    }
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Blast Whatsapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Blast Whatsapp
        </h1>

        <p className={styles.description}>
          Whatsapp blast application
        </p>

        <div className={styles.main}>
          <div className="form">
            <div className="form-group">
              <div className="mt-3">QR Code</div>
              <div className="pa-2">
                <canvas id="canvas" width="800" height="800"></canvas>
              </div>
            </div>
            
            <div className="form-group">
              <div className="mt-3">Upload File</div>
              <div className="border border-dashed border-gray-500 relative rounded-md">
                <input type="file" ref={file} onChange={handleFile} className="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50" />
                <div className="text-center p-10 absolute top-0 right-0 left-0 m-auto">
                  <h4>
                    Drop a file anywhere to upload
                    <br/>or
                  </h4>
                  <p className="">Select a File</p>
                </div>
              </div>
              { fileName ? 
                <div className="mt-1">Selected file { fileName }</div> :
                <div></div>
              }
            </div>
            
            <div className="form-group">
              <div className="mt-3">Message</div>
              <div className="border border-gray-500 relative rounded-md pa-2">
                <textarea className="w-full h-full" rows="5" value={message} onChange={handleMessage}></textarea>
              </div>
            </div>
            
            <div className="form-group">
              <button onClick={executeMessage} className="mt-3 bg-gray-200 hover:bg-gray-300 border border-gray-500 text-black font-bold py-2 px-6 rounded-md">
                Execute
              </button>
            </div>

          </div>
        </div>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}