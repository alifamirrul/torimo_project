import React from 'react'

export default function Button({ children, className = '', variant = 'default', ...props }){
  const baseClasses = "torimo-btn inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  const variantClasses = variant === 'ghost' 
    ? 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300' 
    : ''
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}
