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
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, userProfile } = useAuth()
  const [userItems, setUserItems] = useState([])
  const [swaps, setSwaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

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
        console.error('Error fetching user items:', itemsError)
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
        console.error('Error fetching swaps:', swapsError)
      } else {
        setSwaps(swapsData || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your profile, items, and swaps</p>
        </div>

        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
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
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {userProfile?.name || 'User'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center space-x-1 text-sm text-gray-600">
                  <Gift className="h-4 w-4" />
                  <span>{userProfile?.points || 0} points</span>
                </span>
                <span className="text-sm text-gray-500">
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Link 
              to="/add-item" 
              className="btn-primary flex items-center space-x-2"
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
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{userProfile?.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Balance
                  </label>
                  <p className="text-gray-900">{userProfile?.points || 0} points</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <p className="text-gray-900">
                    {userProfile?.isAdmin ? 'Admin' : 'Regular User'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Items</h3>
                <Link to="/add-item" className="btn-primary">
                  Add New Item
                </Link>
              </div>
              
              {userItems.length === 0 ? (
                <div className="card text-center py-12">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600 mb-4">Start sharing your clothes with the community!</p>
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
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/item/${item.id}`}
                            className="text-primary-600 hover:text-primary-700 p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Swap History</h3>
              
              {swaps.length === 0 ? (
                <div className="card text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps yet</h3>
                  <p className="text-gray-600">Start browsing items to make your first swap!</p>
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
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {swap.items?.title || 'Unknown Item'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {swap.requester_id === user.id 
                                ? `Requested from ${swap.owner?.name || 'Unknown'}`
                                : `Requested by ${swap.requester?.name || 'Unknown'}`
                              }
                            </p>
                            <p className="text-xs text-gray-500">
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