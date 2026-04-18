import React from 'react'
import '../styles/components/Input.css'

const Input = ({placeholder,id, type,onChange, ...rest}) => {
  return (
    <input placeholder={placeholder} id={id} type={type || 'text'} className='input' {...rest} onChange={onChange}>
    </input>
  )
}

export default Input