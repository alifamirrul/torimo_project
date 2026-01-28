import React from 'react'

export const Badge = ({ children, className = '', ...props }) => {
  return (
    <span
      className={
        'torimo-badge inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors ' +
        className
      }
      {...props}
    >
      {children}
    </span>
  )
}
