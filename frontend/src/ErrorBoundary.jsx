import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught error:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
            padding: 16,
            maxWidth: 900,
            margin: '24px auto'
          }}>
            <h2 style={{ marginTop: 0 }}>アプリでエラーが発生しました</h2>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
              {String(this.state.error)}
            </div>
            {this.state.info && this.state.info.componentStack && (
              <details style={{ marginTop: 12, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                <summary>詳細</summary>
                {this.state.info.componentStack}
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
