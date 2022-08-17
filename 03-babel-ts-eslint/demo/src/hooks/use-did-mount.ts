import React from 'react';

export default function useDidMount(cb: () => void) {
  React.useEffect(() => {
    cb();
  }, []);
}
