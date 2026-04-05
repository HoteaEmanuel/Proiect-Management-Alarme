import React from 'react'

const Input = ({placeholder,id, type, ...rest}) => {
  return (
    <input placeholder={placeholder} id={id} type={type || 'text'} className='w-full border rounded-lg p-2 focus:bg-gray-200' {...rest}>
    </input>
  )
}

export default Input