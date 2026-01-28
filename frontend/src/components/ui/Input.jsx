import React from 'react'

export default function Input({ className = '', ...props }){
  return (
    <input 
      className={
        "torimo-input bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#34C759] dark:focus:ring-[#00ff41] focus:border-transparent transition-colors " + 
        className
      } 
      {...props} 
    />
  )
}
