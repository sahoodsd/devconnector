import React, { Fragment,useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import setAuthToken from './utils/setAuthToken';

//Redux
import {Provider} from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';

import './App.css';

if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

const App = () => {

  useEffect(()=>{
    store.dispatch(loadUser());
  },[])

  return (
    <Provider store={store}>
    <Router>
      <Fragment>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
        <section className="container">
          <Alert/>
          <Routes>
            <Route path="/register" element={<Register/>} />
            <Route path="/login" element={<Login/>} />
          </Routes>
        </section>
      </Fragment>
    </Router>
    </Provider>
  );
};

export default App;
