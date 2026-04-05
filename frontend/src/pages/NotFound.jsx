import React from 'react'
import Button from '../components/Button'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate=useNavigate();
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center gap-10'>
      <h1 className='heading'>Not found</h1>
      <img src="/images/404-not-found.png"/>
      <p>This page does not exist</p>
      <button onClick={()=>navigate(-1)} className='btn'>Go back to safety</button>

    </div>
  )
}

export default NotFound