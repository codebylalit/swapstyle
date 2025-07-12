import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">WearShare</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/browse" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Items
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/add-item" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  List an Item
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {userProfile?.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {userProfile?.name || user.email}
                      </span>
                      {userProfile?.points && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {userProfile.points} pts
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link 
              to="/browse" 
              className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Items
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/add-item" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List an Item
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {userProfile?.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {userProfile?.name || user.email}
                      </p>
                      {userProfile?.points && (
                        <p className="text-xs text-gray-500">
                          {userProfile.points} points
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 