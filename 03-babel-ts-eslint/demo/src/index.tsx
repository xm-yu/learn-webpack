import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';
import DemoTest from 'component/demo-test/demo-test';
import useDidMount from 'hooks/use-did-mount';

export default function App() {
  const [count, setCount] = React.useState(0);

  useDidMount(() => {
    console.log('app Component did mount');
  });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button>hello </button>
      <Index msg='1223' />
      <DemoTest />
    </div>
  );
}

interface IIndexProps {
  msg: string;
}

class Index extends Component<IIndexProps> {
  state = {
    count: 0,
  };
  render() {
    return (
      <div onClick={() => this.setState({ count: this.state.count + 1 })}>
        <h3>hello ts</h3>
        {this.state.count || 0}
      </div>
    );
  }
}

const root = createRoot(document.getElementById('root') as Element);
root.render(<App />);

// Enable HMR
if (process.env.NODE_ENV === 'development') {
  console.log('hot');
  const HMR = (module as any).hot;
  HMR && HMR.accept && HMR.accept();
}
