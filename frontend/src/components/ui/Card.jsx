import React from 'react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={
        'torimo-card rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ' +
        className
      }
      {...props}
    >
      {children}
    </div>
  )
}
