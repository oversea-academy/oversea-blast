import Head from 'next/head';
import styles from '../styles/Home.module.css';
import io from 'socket.io-client';

export default function Home() {
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
              </div>
            </div>
            
            <div className="form-group">
              <div className="mt-3">Upload File</div>
              <div className="border border-dashed border-gray-500 relative rounded-md">
                <input type="file" multiple className="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50" />
                <div className="text-center p-10 absolute top-0 right-0 left-0 m-auto">
                  <h4>
                    Drop a file anywhere to upload
                    <br/>or
                  </h4>
                  <p className="">Select a File</p>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="mt-3">Message</div>
              <div className="border border-gray-500 relative rounded-md pa-2">
                <textarea className="w-full h-full" rows="5"></textarea>
              </div>
            </div>
            
            <div className="form-group">
              <button className="mt-3 bg-gray-200 hover:bg-gray-300 border border-gray-500 text-black font-bold py-2 px-6 rounded-md">
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

export async function getServerSideProps() {
  const connection = io();
  
  return {
    props : {
      data: null
    }
  }
}
