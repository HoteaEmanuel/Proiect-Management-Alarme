import React from 'react'
import Button from '@components/Button'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate=useNavigate();
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center gap-10'>
      <h1 className='text-2xl font-bold'>Not found</h1>
      <img src="/images/404-not-found.png"/>
      <p className='font-semibold'>This page does not exist</p>
      <button onClick={()=>navigate(-1)} className='bg-blue-950 p-2 rounded-2xl text-white cursor-pointer hover:scale-105'>Go back to safety</button>

    </div>
  )
}

export default NotFound