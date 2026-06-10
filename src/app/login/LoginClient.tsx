'use client';

import { Suspense } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "@/app/actions/auth";

function LoginMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className='text-sm text-red-500'>{message}</p>;
}

export default function LoginClient({ message }: { message?: string }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center text-gray-900'>Welcome Back</h1>
        <form action={signInWithEmailAndPassword} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email Address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember'
                name='remember'
                type='checkbox'
                className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
              />
              <label
                htmlFor='remember'
                className='block ml-2 text-sm text-gray-900'
              >
                Remember me
              </label>
            </div>
            <div className='text-sm'>
              <Link
                href='/auth/forgot-password'
                className='font-medium text-indigo-600 hover:text-indigo-500'
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          <button
            type='submit'
            className='w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Sign In
          </button>
          <Suspense fallback={null}>
            <LoginMessage message={message} />
          </Suspense>
        </form>
        <p className='text-sm text-center text-gray-600'>
          Don't have an account?{' '}
          <Link href='/signup' className='font-medium text-indigo-600 hover:text-indigo-500'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
