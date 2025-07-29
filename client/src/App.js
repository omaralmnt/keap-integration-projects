import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Callback from './components/auth/Callback';
import Dashboard from './components/dashboard/Dashboard';
import { AffiliatesManagement } from './components/affiliates/AffiliatesManagement';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/auth/callback' element={<Callback/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/affiliates' element = {<AffiliatesManagement/>}/>
    </Routes>
  );
}

export default App;
