import ButtonDefault from './Button.jsx'

// Bridge file to support `import { Button } from './components/ui/button'`
// Avoid JSX here to keep it plain JS-compatible for the build pipeline.
export const Button = ButtonDefault

export default ButtonDefault
