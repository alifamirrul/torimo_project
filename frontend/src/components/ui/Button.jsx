import React from 'react'

export default function Button({ children, className = '', ...props }){
  return (
    <button className={"torimo-btn " + className} {...props}>
      {children}
    </button>
  )
}
