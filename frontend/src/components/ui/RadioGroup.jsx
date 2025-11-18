import React from 'react'

export function RadioGroup({ children, value, onValueChange, className = '' }){
  // helper to recursively clone and inject props into RadioGroupItem elements
  // create a unique name for this radio group to avoid cross-group interference
  const groupName = React.useId ? React.useId() : ('rg-' + Math.random().toString(36).slice(2,7))

  const cloneWithProps = (node) => {
    if (!React.isValidElement(node)) return node

    // If this node is a RadioGroupItem, inject checked/onChange/name
    if (node.type && node.type.displayName === 'RadioGroupItem' || node.type === RadioGroupItem) {
      const nodeValue = node.props.value
      return React.cloneElement(node, {
        name: groupName,
        checked: nodeValue === value,
        onChange: () => onValueChange(nodeValue)
      })
    }

    // Otherwise, if it has children, recursively process them
    const props = node.props || {}
    if (props.children) {
      const newChildren = React.Children.map(props.children, cloneWithProps)
      return React.cloneElement(node, { ...props }, newChildren)
    }

    return node
  }

  return (
    <div className={className} role="radiogroup">
      {React.Children.map(children, cloneWithProps)}
    </div>
  )
}

export function RadioGroupItem({ value, id, checked, onChange, name }){
  return (
    <input id={id} name={name} type="radio" value={value} checked={checked} onChange={onChange} />
  )
}

RadioGroupItem.displayName = 'RadioGroupItem'
