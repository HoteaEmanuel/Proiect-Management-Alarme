import React from 'react'
import { IoAlertSharp } from "react-icons/io5";
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
const Home = () => {

  const navigate=useNavigate();
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center gap-10'>
      <h1 className='text-5xl font-bold'>Monitor Smarter. Respond Faster</h1>
      <h1 className='text-4xl font-bold'>Visualize network issues</h1>
      <button onClick={()=>navigate('/login')} className='btn w-1/10 h-15 shadow-2xl'>Get started</button>
    </div>
  )
}

export default Home