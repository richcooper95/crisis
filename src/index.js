import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from 'aws-amplify';
import awsmobile from './aws-exports';
import './index.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

Amplify.configure(awsmobile);

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

