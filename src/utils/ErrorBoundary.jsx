import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '800px', 
          margin: '2rem auto',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#c00', marginBottom: '1rem' }}>Oops! Something went wrong</h1>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '1rem', 
            overflow: 'auto',
            fontSize: '12px',
            color: '#333'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
