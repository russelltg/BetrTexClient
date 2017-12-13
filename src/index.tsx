import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppContainer from './AppContainer';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <div>
  <AppContainer  />
  </div>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
