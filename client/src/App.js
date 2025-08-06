import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/auth/Login';
import Callback from './components/auth/Callback';
import Dashboard from './components/dashboard/Dashboard';
import { Affiliates } from './components/affiliates/Affiliates';
import { Layout } from './components/layout/Layout';
import { Contacts } from './components/contacts/Contacts';
import { CreateOrUpdateContact } from './components/contacts/CreateOrUpdateContact';
import { ContactProfile } from './components//contacts/ContactProfile';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { CreateContact } from './components/contacts/CreateContact';
import { Tags } from './components/tags/Tags';
import { TagDetails } from './components/tags/TagDetails';
import { Emails } from './components/emails/Emails';
import { EmailCompose } from './components/emails/EmailCompose';
import { Companies } from './components/companies/Companies';
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
      {/* TAG ROUTES --------------------------------------------*/}
      <Route path='/tags' element={
        <ProtectedRoute>
          <Tags/>
        </ProtectedRoute>
      }/>
      <Route path='/tags/details/:tagId' element={
        <ProtectedRoute>
          <TagDetails/>
        </ProtectedRoute>
      }/>
      {/* EMAIL ROUTES --------------------------------------------*/}
      <Route path='/emails' element={
        <ProtectedRoute>
          <Emails/>
        </ProtectedRoute>
      }/>     
      <Route path='/emails/create' element={
        <ProtectedRoute>
          <EmailCompose/>
        </ProtectedRoute>
      }/>    

      {/* COMPANY ROUTES --------------------------------------------*/}
       <Route path='/companies' element={
        <ProtectedRoute>
          <Companies/>
        </ProtectedRoute>
      }/>    
    </Routes>
    <ToastContainer />

    </>
  );
}

export default App;