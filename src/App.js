import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './pages/Dashboard'
import ItemDetail from './pages/ItemDetail'
import AddItem from './pages/AddItem'
import BrowseItems from './pages/BrowseItems'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './lib/supabase';
import AdminPanel from './pages/AdminPanel'
import AdminRoute from './components/AdminRoute'

function App() {
  
useEffect(() => {
  async function testSupabase() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('[DEBUG] Supabase test:', { data, error });
  }
  testSupabase();
}, []);
  return (
    
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-almond">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/browse" element={<BrowseItems />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-item" 
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                } 
              />
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
