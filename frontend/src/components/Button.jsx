import React from 'react'

const Button = ({ children, onClick, type='button', ...props }) => {
  return (
    <button className='btn' onClick={onClick} type={type} { ...props}>{children}</button>
  )
}

export default Button