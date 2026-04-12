import React from 'react'
import { IoAlertSharp } from "react-icons/io5";
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Home.css'

const Home = () => {

  const navigate=useNavigate();
  return (
    <div className="home-page">
      <h1 className="home-title">Monitor Smarter. Respond Faster</h1>
      <h1 className="home-subtitle">Visualize network issues</h1>
      <button className="home-button" onClick={()=>navigate('/login')}>Get started</button>
    </div>
  )
}

export default Home
