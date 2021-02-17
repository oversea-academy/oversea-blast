import Head   from 'next/head';
import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';

export default function Login() {
    const [dataEmail, setDataEmail]         = useState('');
    const [dataPassword, setDataPassword]   = useState('');
    const [isSignIn, setIsSignIn]           = useState(false);

    function handleEmail(e) {
        if (e.target.value) {
            if (e.target.value.includes('@')) {
                setDataEmail(e.target.value);
            } else {
                setDataEmail(null);
            }
        } else {
            setDataEmail(null);
        }
    }

    function handlePassword(e) {
        setDataPassword(e.target.value);
    }

    function signIn(e) {
        e.preventDefault();
        if (dataEmail && dataPassword) {
            setIsSignIn(true);
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: dataEmail,
                    password: dataPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    const token = data.data.token;
                    const cookies = new Cookies();
                    cookies.set('token', token, { 
                        path: '/',
                        maxAge: 3600*4,
                        sameSite: 'strict',
                        httpOnly: false,
                        secure: false 
                    });
                    window.location = window.origin;
                } else {
                    setIsSignIn(true);
                }
            })
            .catch((error) => {
                setIsSignIn(false);
                console.error('Error:', error);
            });
        }
    }

    return (
        <div>
            <Head>
                <title>Overblast Login</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <img className="mx-auto h-12 w-auto" src="/logo.svg" alt="Workflow" />
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Sign in to your account
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" action="">
                            <input type="hidden" name="remember" value="true" />
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="email-address" className="sr-only">Email address</label>
                                    <input value={dataEmail} onChange={handleEmail} id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input value={dataPassword} onChange={handlePassword} id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button onClick={signIn} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" >
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        {
                                            isSignIn ? 
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            :
                                            <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" >
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg> 
                                        } 
                                    </span>
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}