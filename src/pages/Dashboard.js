import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES } from '../lib/supabase'
import { 
  User, 
  Gift, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth()
  const [userItems, setUserItems] = useState([])
  const [swaps, setSwaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState(null);

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // Fetch user's items
      const { data: itemsData, error: itemsError } = await supabase
        .from(TABLES.ITEMS)
        .select('*')
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false })

      if (itemsError) {
        setError(itemsError.message || 'Error fetching user items');
      } else {
        setUserItems(itemsData || [])
      }

      // Fetch swaps (both as requester and owner)
      const { data: swapsData, error: swapsError } = await supabase
        .from(TABLES.SWAPS)
        .select(`
          *,
          items:item_id(title, images),
          requester:requester_id(name),
          owner:owner_id(name)
        `)
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (swapsError) {
        setError(swapsError.message || 'Error fetching swaps');
      } else {
        setSwaps(swapsData || [])
      }
    } catch (err) {
      setError('Error fetching user data: ' + (err.message || err));
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .delete()
        .eq('id', itemId)

      if (error) {
        toast.error('Error deleting item')
      } else {
        toast.success('Item deleted successfully')
        fetchUserData()
      }
    } catch (error) {
      toast.error('Error deleting item')
    }
  }

  const getSwapStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'accepted':
        return 'text-green-600 bg-green-100'
      case 'declined':
        return 'text-red-600 bg-red-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSwapStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />
      case 'declined':
        return <XCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-almond py-8 w-full px-4 sm:px-8">
      <ErrorMessage message={error} />
      <div className="w-full px-0 sm:px-0">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-carob">Dashboard</h1>
            <p className="text-matcha">Manage your profile, items, and swaps</p>
          </div>
          {/* {userProfile && (userProfile.isAdmin === true || userProfile.isAdmin === 'true') && ( */}
            <Link to="/admin" className="btn-red-500 mt-4 sm:mt-0">
              Go to Admin Panel
            </Link>
          {/* )} */}
        </div>
        {/* Profile Card */}
        <div className="card mb-8 w-full">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            {userProfile?.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt="Profile" 
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
            )}
            <div className="flex-1 w-full">
              <h2 className="text-xl font-semibold text-carob">
                {userProfile?.name || 'User'}
              </h2>
              <p className="text-matcha">{user?.email}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <span className="flex items-center space-x-1 text-sm text-matcha">
                  <Gift className="h-4 w-4" />
                  <span>{userProfile?.points || 0} points</span>
                </span>
                <span className="text-sm text-chai">
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Link 
              to="/add-item" 
              className="btn-primary flex items-center space-x-2 w-full md:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'items', label: 'My Items' },
              { id: 'swaps', label: 'Swaps' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-chai hover:text-carob hover:border-pistache'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-carob mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">
                    Full Name
                  </label>
                  <p className="text-carob">{userProfile?.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">
                    Email
                  </label>
                  <p className="text-carob">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">
                    Points Balance
                  </label>
                  <p className="text-carob">{userProfile?.points || 0} points</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">
                    Account Type
                  </label>
                  <p className="text-carob">
                    {userProfile?.isAdmin ? 'Admin' : 'Regular User'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="btn-red-500 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-carob">My Items</h3>
                <Link to="/add-item" className="btn-primary">
                  Add New Item
                </Link>
              </div>
              
              {userItems.length === 0 ? (
                <div className="card text-center py-12">
                  <Gift className="h-12 w-12 text-chai mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-carob mb-2">No items yet</h3>
                  <p className="text-matcha mb-4">Start sharing your clothes with the community!</p>
                  <Link to="/add-item" className="btn-primary">
                    List Your First Item
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map((item) => (
                    <div key={item.id} className="card">
                      <div className="aspect-w-1 aspect-h-1 mb-4">
                        {item.images && item.images[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-pistache rounded-lg flex items-center justify-center">
                            <span className="text-chai">No image</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-carob mb-2">{item.title}</h4>
                      <p className="text-sm text-matcha mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'available' 
                            ? 'bg-matcha text-vanilla'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-pistache text-carob'
                        }`}>
                          {item.status}
                        </span>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/item/${item.id}`}
                            className="text-primary hover:text-carob p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-chai hover:text-carob p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Swaps Tab */}
          {activeTab === 'swaps' && (
            <div>
              <h3 className="text-lg font-semibold text-carob mb-6">Swap History</h3>
              
              {swaps.length === 0 ? (
                <div className="card text-center py-12">
                  <Clock className="h-12 w-12 text-chai mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-carob mb-2">No swaps yet</h3>
                  <p className="text-matcha">Start browsing items to make your first swap!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {swap.items?.images && swap.items.images[0] ? (
                              <img 
                                src={swap.items.images[0]} 
                                alt={swap.items.title}
                                className="h-12 w-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-pistache rounded-lg flex items-center justify-center">
                                <span className="text-chai text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-carob">
                              {swap.items?.title || 'Unknown Item'}
                            </h4>
                            <p className="text-sm text-matcha">
                              {swap.requester_id === user.id 
                                ? `Requested from ${swap.owner?.name || 'Unknown'}`
                                : `Requested by ${swap.requester?.name || 'Unknown'}`
                              }
                            </p>
                            <p className="text-xs text-chai">
                              {new Date(swap.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getSwapStatusColor(swap.status)}`}>
                            {getSwapStatusIcon(swap.status)}
                            <span className="capitalize">{swap.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 