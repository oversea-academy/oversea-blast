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
  const [mode, setMode]           = useState("default");
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
          mode: mode,
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

  function signOut(e) {
    e.preventDefault();
    const cookies = new Cookies();
    cookies.remove('token');
    window.location.reload();
  }

  function selectMode(e) {
    setMode(e.target.value);
  }

  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
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
    const token   = cookies.get('token');
        
    if (!token) {
      window.location = window.origin + '/login'; 
    } else {
      setIsLogged(true);
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Overblast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        isLogged ?
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
                    <img className="block lg:hidden h-8 w-auto" src="/logo.svg" alt="Logo" />
                    <img className="hidden lg:block h-8 w-auto" src="/logo-text.svg" alt="Logo" />
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
                      <button onClick={signOut} className="group relative w-full flex justify-center py-2 px-4 border border-transparent focus:border-transparent text-sm font-medium rounded-md text-white bg-transparent">
                        <span className="left-0 inset-y-0 flex items-center pr-1">
                          <svg className="h-5 w-5 text-white items-center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" >
                              <path d="M15.608,6.262h-2.338v0.935h2.338c0.516,0,0.934,0.418,0.934,0.935v8.879c0,0.517-0.418,0.935-0.934,0.935H4.392c-0.516,0-0.935-0.418-0.935-0.935V8.131c0-0.516,0.419-0.935,0.935-0.935h2.336V6.262H4.392c-1.032,0-1.869,0.837-1.869,1.869v8.879c0,1.031,0.837,1.869,1.869,1.869h11.216c1.031,0,1.869-0.838,1.869-1.869V8.131C17.478,7.099,16.64,6.262,15.608,6.262z M9.513,11.973c0.017,0.082,0.047,0.162,0.109,0.226c0.104,0.106,0.243,0.143,0.378,0.126c0.135,0.017,0.274-0.02,0.377-0.126c0.064-0.065,0.097-0.147,0.115-0.231l1.708-1.751c0.178-0.183,0.178-0.479,0-0.662c-0.178-0.182-0.467-0.182-0.645,0l-1.101,1.129V1.588c0-0.258-0.204-0.467-0.456-0.467c-0.252,0-0.456,0.209-0.456,0.467v9.094L8.443,9.553c-0.178-0.182-0.467-0.182-0.645,0c-0.178,0.184-0.178,0.479,0,0.662L9.513,11.973z"></path>
                          </svg>
                        </span>
                        <span className="hidden lg:block h-8 w-auto items-center">Sign out</span>
                      </button>
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

          <div className="min-h-screen flex justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="part-left">
                  <div className="form">
                    <div className="form-group">
                      <div className="mt-3 mb-1 font-semibold">QR Code</div>
                      <div className="pa-2">
                        <canvas className="border border-dashed border-gray-500 w-full rounded-md" id="canvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="part-right">
                  <div className="form">
                    <div className="form-group">
                      <div className="mt-3 mb-1 flex justify-between">
                        <div className="font-semibold">Upload File</div>
                        <div>
                          <a href="/format_blast.xlsx" download className="text-sm underline hover:text-indigo-500 text-indigo-600">
                            Download format file
                          </a>
                        </div>
                      </div>
                      <div className="border border-dashed border-gray-500 relative rounded-md bg-gray-100">
                        <input type="file" ref={file} onChange={handleFile} className="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50" />
                        <div className="text-sm text-center p-10 absolute top-0 right-0 left-0 m-auto">
                          <div>
                            Drop xlsx or csv file anywhere to upload
                            <br/>or
                          </div>
                          <p>Select a file</p>
                        </div>
                      </div>
                      { fileName ? 
                        <div className="text-sm mt-1">Selected file <span className="text-indigo-500">{ fileName }</span></div> :
                        <div></div>
                      }
                    </div>
                    
                    <div className="form-group">
                      <div className="mt-3 mb-1 font-semibold">Message</div>
                      <div className="mb-1 text-sm">Tip: <span className="text-indigo-500">#name</span> for name customization, <span className="text-indigo-500">#structure #reading #listening #total </span>for TOEFL mode</div>
                      <div className="box border rounded-md flex flex-col shadow bg-white">
                        <textarea placeholder="Enter message here.." rows="5" className="text-grey-darkest flex-1 p-2 m-1 bg-transparent" value={message} onChange={handleMessage}></textarea>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="mt-3 mb-1 font-semibold">Add an Image</div>
                      <div>
                        <input className="text-sm" type="file" ref={image} onChange={handleImage}></input>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="mt-3 mb-1 font-semibold">Mode</div>
                      <div onChange={selectMode}>
                        <label className="inline-flex items-center">
                          <input type="radio" className="form-radio" name="mode" value="default" defaultChecked/>
                          <span className="ml-2">Default</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                          <input type="radio" className="form-radio" name="mode" value="toefl"/>
                          <span className="ml-2">TOEFL Score</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="form-group"> 
                      {
                        isLoading ?
                        <div className=" mt-3 flex">
                          <button disabled className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                            Execute
                          </button>
                        </div> 
                        :
                        <div className=" mt-3 flex">
                          <button  onClick={executeMessage} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-indigo-100 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" >
                                <path fillRule="none" d="M17.218,2.268L2.477,8.388C2.13,8.535,2.164,9.05,2.542,9.134L9.33,10.67l1.535,6.787c0.083,0.377,0.602,0.415,0.745,0.065l6.123-14.74C17.866,2.46,17.539,2.134,17.218,2.268 M3.92,8.641l11.772-4.89L9.535,9.909L3.92,8.641z M11.358,16.078l-1.268-5.613l6.157-6.157L11.358,16.078z" />
                            </svg>
                          </span>
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
          </div>
        </main>
        :
        <main>
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> 
          <h2 className="text-center text-white text-xl font-semibold">Loading...</h2>
          <p className="w-1/3 text-center text-white">This may take a few seconds, please don't close this page.</p>
        </div>
        </main>
      }


    </div>
  )
}