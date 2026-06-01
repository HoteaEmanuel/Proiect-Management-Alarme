import React from 'react'

const Button = ({ children, onClick, type='button', disabled = false, ...props }) => {
  return (
    <button className='btn' onClick={onClick} type={type} disabled={disabled} { ...props}>{children}</button>
  )
}

export default Button