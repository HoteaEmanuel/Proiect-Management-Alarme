import React from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user} = useAuthStore();
  const navigate=useNavigate();
  console.log(user);
  return (
    <div>Dashboard
    
    </div>
   
  )
}

export default Dashboard