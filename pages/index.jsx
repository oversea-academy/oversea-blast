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
  const [image, setImage]         = useState(React.createRef());
  const [dataImage, setDataImage] = useState(null);
  const [imageExt, setImageExt] = useState(null);
  const [fileName, setFileName]   = useState(null);
  const [dataExcel, setDataExcel] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function executeMessage(e) {
    e.preventDefault();
    if (message && dataExcel.length) {
      if (confirm('Are you sure?')) {
        setIsLoading(true);
        setStatusMsg("Loading...");
        const data = {
          message,
          rows: dataExcel,
          image_ext: imageExt,
          image_data: dataImage
        }
        socket.emit("message", data);
      }
    } else {
      alert('Message and file is empty');
    }
  }

  function handleFile(e) {
    e.preventDefault();
    const name  = file.current.files[0] ? file.current.files[0].name : null;
    if (name) {
      const ext   = name.match(/((xlsx)|(csv))$/g);
      if (ext) {
        setFileName(file.current.files[0].name);
        convertExcel(file.current.files[0]);
      } else {
        setFileName(null);
        setDataExcel([]);
        alert('File format is not valid')
      }
    }
  }

  function handleImage(e) {
    e.preventDefault();
    const name  = image.current.files[0] ? image.current.files[0].name : null;
    if (name) {
      const ext   = name.toLowerCase().match(/((jpeg)|(jpg)|(png))$/g);
      if (ext) {
        setImageExt(ext[0]);
        readImage(image.current.files[0]);
      } else {
        setImageExt(null);
        setDataImage(null);
        alert('File format is not valid')
      }
    }
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  function readImage(fileImage) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 =  e.target.result.replace(/.*base64,/, '');
      setDataImage(base64);
    };
    reader.onerror = function(ex) {
      console.log(ex);
    };
    reader.readAsDataURL(fileImage);
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
      socket.on("message", (message) => {
        console.log(message);
        if (message.action == 'qr') {
          renderQRCode(message.data);
          setStatusMsg(message.statusMsg);
          setIsLoading(message.loader);
        } else if (message.action == 'ready') {
          setStatusMsg(message.statusMsg);
          setIsLoading(message.loader);
        } else if (message.action == 'progress') {
          setStatusMsg(message.statusMsg);
          setIsLoading(message.loader);
        } else if (message.action == 'done') {
          setStatusMsg(message.statusMsg);
          setIsLoading(message.loader);
        }
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
              <div className="mt-3 mb-1 font-semibold">QR Code</div>
              <div className="pa-2">
                <canvas className="border border-dashed border-gray-500" id="canvas" width="200" height="200"></canvas>
              </div>
            </div>
            
            <div className="form-group">
              <div className="mt-3 mb-1 font-semibold">Upload File</div>
              <div className="mt-3 mb-2">
                <a href="/format_blast.xlsx" download className="bg-green-500 hover:bg-green-600 border border-green-500 text-white py-1 px-1 rounded-md">
                  Download format file
                </a>
              </div>
              <div className="border border-dashed border-gray-500 relative rounded-md bg-gray-100">
                <input type="file" ref={file} onChange={handleFile} className="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50" />
                <div className="text-center p-10 absolute top-0 right-0 left-0 m-auto">
                  <h4>
                    Drop xlsx or csv file anywhere to upload
                    <br/>or
                  </h4>
                  <p className="">Select a file</p>
                </div>
              </div>
              { fileName ? 
                <div className="mt-1">Selected file <span className="text-blue-500">{ fileName }</span></div> :
                <div></div>
              }
            </div>
            
            <div className="form-group">
              <div className="mt-3 font-semibold">Message</div>
              <div className="mb-1">Tip: <span className="text-blue-500">#name</span> for name customization</div>
              <div className="border border-gray-500 relative rounded-md pa-2">
                <textarea className="w-full h-full" rows="5" value={message} onChange={handleMessage}></textarea>
              </div>
            </div>

            <div className="form-group">
              <div className="mt-3 font-semibold">Add an Image</div>
              <div>
                <input type="file" ref={image} onChange={handleImage}></input>
              </div>
            </div>
            
            <div className="form-group"> 
              {
                isLoading ?
                <div className=" mt-3 flex">
                  <button disabled onClick={executeMessage} className="bg-gray-500 border border-gray-500 text-white font-bold py-1 px-6 rounded-md">
                    Execute
                  </button>
                  <div className={styles.loader}></div>
                </div> 
                :
                <div className=" mt-3 flex">
                  <button  onClick={executeMessage} className="bg-blue-800 hover:bg-blue-700 border border-blue-800 text-white font-bold py-1 px-6 rounded-md">
                    Execute
                  </button>
                </div>
              }
              { statusMsg ? 
                <p>Status : { statusMsg }</p> :
                <p></p>
              }
            </div>

          </div>
        </div>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/arifintahu"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by <span className="font-semibold"> @arifintahu</span>
        </a>
      </footer>
    </div>
  )
}