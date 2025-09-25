import { BrowserRouter as Router } from 'react-router-dom';

import MainPage from './pages/MainPage';
import { initIsDemoAtom } from './store/isDemoStore';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

function App() {
  const initIsDemo = useSetAtom(initIsDemoAtom);
  useEffect(() => {
    initIsDemo();
  }, [initIsDemo]);


  return (
    <Router>
      <MainPage />
    </Router>
  );
}

export default App; 