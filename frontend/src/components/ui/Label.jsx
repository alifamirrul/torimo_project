import React from 'react'

export default function Label({ children, htmlFor, className = '' }){
  return (
    <label htmlFor={htmlFor} className={"torimo-label " + className}>
      {children}
    </label>
  )
}
