import Head   from 'next/head';
import io     from 'socket.io-client';
import React, { 
  useState, 
  useEffect
} from 'react';
import xlsx   from 'xlsx';
import QRCode from 'qrcode';
import Cookies from 'universal-cookie';

export default function Home() {
  const [socket, setSocket]       = useState(io());
  const [message, setMessage]     = useState("");
  const [file, setFile]           = useState(React.createRef());
  const [image, setImage]         = useState(React.createRef());
  const [dataImage, setDataImage] = useState(null);
  const [imageExt, setImageExt]   = useState(null);
  const [fileName, setFileName]   = useState(null);
  const [dataExcel, setDataExcel] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged]   = useState(false);

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
  }, []);

  useEffect(() => {
    const cookies = new Cookies();
    const token = cookies.get('token');
    
    console.log(token);
    
    if (!token) {
      window.location = window.origin + '/login'; 
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Oversea Blast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        !isLogged ?
        <main>
          <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
                    <img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" alt="Workflow" />
                  </div>
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-4">
                      <a href="#" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <div className="ml-3 relative">
                    <div className="flex space-x-4">
                      <a href="#" className="text-white px-3 py-2 text-sm font-medium">Sign out</a>
                    </div> 
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#" className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
              </div>
            </div>
          </nav>

          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div>
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

            </div>
          </div>
        </main>
        :
        <main>
          <h1>Loading</h1>
        </main>
      }


    </div>
  )
}