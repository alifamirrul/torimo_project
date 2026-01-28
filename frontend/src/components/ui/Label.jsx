import React from 'react'

export default function Label({ children, htmlFor, className = '' }){
  return (
    <label 
      htmlFor={htmlFor} 
      className={"torimo-label text-sm font-medium text-gray-700 dark:text-zinc-300 transition-colors " + className}
    >
      {children}
    </label>
  )
}
