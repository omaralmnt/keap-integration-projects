import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Callback from './components/auth/Callback';
import Dashboard from './components/dashboard/Dashboard';
import { Affiliates } from './components/affiliates/Affiliates';
import { Layout } from './components/layout/Layout';
import { Contacts } from './contacts/Contacts';
import { CreateOrUpdateContact } from './contacts/CreateOrUpdateContact';
import { ContactProfile } from './contacts/ContactProfile';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { CreateContact } from './contacts/CreateContact';
// Componente wrapper para rutas protegidas
const ProtectedRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <>
    <Routes>
      {/* Auth routes */}
      <Route path='/' element={<Login/>}/>
      <Route path='/auth/callback' element={<Callback/>}/>
      
      {/* Protected routes */}
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>
      <Route path='/affiliates' element={
        <ProtectedRoute>
          <Affiliates/>
        </ProtectedRoute>
      }/>
      <Route path='/contacts' element={
        <ProtectedRoute>
          <Contacts/>
        </ProtectedRoute>
      }/>
      <Route path='/contacts/createOrUpdate' element={
        <ProtectedRoute>
          <CreateOrUpdateContact/>
        </ProtectedRoute>
      }/>
      <Route path='/contacts/create' element={
        <ProtectedRoute>
          <CreateContact/>
        </ProtectedRoute>
      }/>
      <Route path='/contacts/profile/:id' element={
        <ProtectedRoute>
          <ContactProfile/>
        </ProtectedRoute>
      }/>
      
    </Routes>
    <ToastContainer />

    </>
  );
}

export default App;