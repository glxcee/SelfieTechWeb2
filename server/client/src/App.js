import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/header';
import Home from './components/home'
import LoginPage from './login'
import ProfilePage from './components/profile'
import TomatoPage from './components/tomato/tomato';

import { address } from "./utils"

function HomeContainer(props) {
  return (<div>
    <Header user={props.user}/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<ProfilePage user={props.user} />} />
      <Route path="/tomato" element={<TomatoPage />} />
    </Routes>
  </div>)
}

function App() {
  const [user, setUser] = useState(() => {
    // Leggi i dati da localStorage al primo caricamento
    const savedData = localStorage.getItem('selfieUser');
    return savedData ? savedData : ''; // Dati di default se non esistono
  })

  useEffect(() => {
    fetch(address+'api/test')
      .then(res => res.json())
      .then(testData => console.log(testData))

    if(user) localStorage.setItem('selfieUser', user)
  },[user])

  /*
  useEffect(() => {
    fetch('http://localhost:3001/api/test')
      .then(res => res.json())
      .then(testData => console.log(testData))
  },[]) */

  return (
    <Router>
      <div>
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route path="/selfie/*" element={<HomeContainer user={user} />} />
      </Routes>
      </div>
    </Router>
  )
}

export default App;
