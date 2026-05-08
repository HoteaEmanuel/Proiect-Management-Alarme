import React from 'react'

const Button = ({ children, onClick, ...props }) => {
  return (
    <button className='btn' onClick={onClick} { ...props}>{children}</button>
  )
}

export default Button