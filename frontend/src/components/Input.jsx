import React from 'react'
import '../styles/components/Input.css'

const Input = ({placeholder,id, type, ...rest}) => {
  return (
    <input placeholder={placeholder} id={id} type={type || 'text'} className='input' {...rest}>
    </input>
  )
}

export default Input