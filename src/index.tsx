import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { CustomProvider } from 'rsuite';
import 'rsuite/styles/index.less';

const root = ReactDOM.createRoot(document.getElementById('main') as Element);

const render = () => root.render(<CustomProvider theme="dark"><App /></CustomProvider>)

render();