import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import awsExports from './aws-exports';

Amplify.configure(awsExports);
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);