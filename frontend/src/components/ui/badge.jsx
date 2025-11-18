import React from 'react'

export const Badge = ({ children, className = '', ...props }) => {
  return (
    <span
      className={
        'torimo-badge ' +
        className
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        fontSize: 12,
        borderRadius: 999,
        border: '1px solid #e5e7eb',
        background: '#f9fafb',
        color: '#374151',
      }}
      {...props}
    >
      {children}
    </span>
  )
}
