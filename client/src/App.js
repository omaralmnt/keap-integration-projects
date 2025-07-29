import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Callback from './components/auth/Callback';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/auth/callback' element={<Callback/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
  );
}

export default App;
