import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';

export default function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button>23ddd</button>
      <Index />
    </div>
  );
}

class Index extends Component {
  state = {
    count: 0,
  };
  render() {
    return (
      <div onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count || 0}
      </div>
    );
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Enable HMR
if (process.env.NODE_ENV === 'development') {
  console.log('hot');
  const HMR = module.hot;
  HMR && HMR.accept && HMR.accept();
}
