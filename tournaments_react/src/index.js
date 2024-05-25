import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AuthReducer from "./Context/Reducer";
import {message} from "antd";
import {Context, ContextProvider} from "./Context/Context";

const root = ReactDOM.createRoot(document.getElementById('root'));





root.render(<ContextProvider>
    <App/>
</ContextProvider>);

