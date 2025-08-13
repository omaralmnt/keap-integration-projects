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
import { Users } from './components/users/Users';
import { Notes } from './components/notes/Notes';
import { Appointments } from './components/appointments/Appointments';
import { Tasks } from './components/tasks/Tasks';
import { Files } from './components/files/Files';
import { ApplicationSettings } from './components/settings/ApplicationSettings';
import { Products } from './components/products/Products';
import { ProductDetails } from './components/products/ProductDetails';
import { Merchants } from './components/merchants/Merchants';
import { Orders } from './components/orders/Orders';
import { CreateOrder } from './components/orders/CreateOrder';
import { OrderDetails } from './components/orders/OrderDetails';
import { Subscriptions } from './components/subscriptions/Subscriptions';
import { Opportunities } from './components/opportunities/Opportunities';
import { Campaigns } from './components/campaigns/Campaigns';
import { CampaignDetails } from './components/campaigns/CampaignDetails';
// Componente wrapper para rutas protegidas
const ProtectedRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path='/' element={<Login />} />
        <Route path='/auth/callback' element={<Callback />} />

        {/* Protected routes */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/affiliates' element={
          <ProtectedRoute>
            <Affiliates />
          </ProtectedRoute>
        } />
        <Route path='/contacts' element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        } />
        <Route path='/contacts/createOrUpdate' element={
          <ProtectedRoute>
            <CreateOrUpdateContact />
          </ProtectedRoute>
        } />
        <Route path='/contacts/create' element={
          <ProtectedRoute>
            <CreateContact />
          </ProtectedRoute>
        } />
        <Route path='/contacts/profile/:id' element={
          <ProtectedRoute>
            <ContactProfile />
          </ProtectedRoute>
        } />
        {/* TAG ROUTES --------------------------------------------*/}
        <Route path='/tags' element={
          <ProtectedRoute>
            <Tags />
          </ProtectedRoute>
        } />
        <Route path='/tags/details/:tagId' element={
          <ProtectedRoute>
            <TagDetails />
          </ProtectedRoute>
        } />
        {/* EMAIL ROUTES --------------------------------------------*/}
        <Route path='/emails' element={
          <ProtectedRoute>
            <Emails />
          </ProtectedRoute>
        } />
        <Route path='/emails/create' element={
          <ProtectedRoute>
            <EmailCompose />
          </ProtectedRoute>
        } />

        {/* COMPANY ROUTES --------------------------------------------*/}
        <Route path='/companies' element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        } />

        {/* USER ROUTES --------------------------------------------*/}
        <Route path='/users' element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        {/* NOTE ROUTES --------------------------------------------*/}
        <Route path='/notes' element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } />
        {/* APPTS ROUTES --------------------------------------------*/}
        <Route path='/appointments' element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        {/* TASKS ROUTES --------------------------------------------*/}
        <Route path='/tasks' element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        {/* TASKS ROUTES --------------------------------------------*/}
        <Route path='/files' element={
          <ProtectedRoute>
            <Files />
          </ProtectedRoute>
        } />
        {/* APPLICATION ROUTES --------------------------------------------*/}
        <Route path='/application/settings' element={
          <ProtectedRoute>
            <ApplicationSettings />
          </ProtectedRoute>
        } />

        {/* Products ROUTES --------------------------------------------*/}
        <Route path='/products' element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />

        <Route path='/products/details/:productId' element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        } />


        <Route path='/merchants' element={
          <ProtectedRoute>
            <Merchants />
          </ProtectedRoute>
        } />
        {/* orders rouutes */}
        <Route path='/orders' element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path='/orders/create' element={
          <ProtectedRoute>
            <CreateOrder />
          </ProtectedRoute>
        } />
        <Route path='/orders/details/:orderId' element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />


        <Route path='/subscriptions' element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        } />

        {/* Opportunities endpoints ----------*/}

        <Route path='/opportunities' element={
          <ProtectedRoute>
            <Opportunities />
          </ProtectedRoute>
        } />

        <Route path='/campaigns' element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        } />
        <Route path='/campaigns/details/:campaignId' element={
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer />

    </>
  );
}

export default App;