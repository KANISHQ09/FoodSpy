import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CardSection from './components/CardSection'
import Home from './components/Home'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/addToCard' element={<CardSection />}></Route>
      </Routes>
    </div>
  )
}

export default App
