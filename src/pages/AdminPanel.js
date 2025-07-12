import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES } from '../lib/supabase'
import { 
  Users, 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import ErrorMessage from '../components/ErrorMessage';

const AdminPanel = () => {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('pending')
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingItems: 0,
    totalUsers: 0,
    totalSwaps: 0
  })
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stats
      const [itemsCount, pendingCount, usersCount, swapsCount] = await Promise.all([
        supabase.from(TABLES.ITEMS).select('*', { count: 'exact' }),
        supabase.from(TABLES.ITEMS).select('*', { count: 'exact' }).eq('approved', false),
        supabase.from(TABLES.USERS).select('*', { count: 'exact' }),
        supabase.from(TABLES.SWAPS).select('*', { count: 'exact' })
      ])

      setStats({
        totalItems: itemsCount.count || 0,
        pendingItems: pendingCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalSwaps: swapsCount.count || 0
      })

      // Fetch items based on active tab
      if (activeTab === 'pending') {
        const { data: pendingItems } = await supabase
          .from(TABLES.ITEMS)
          .select(`
            *,
            users:uploader_id(name, email)
          `)
          .eq('approved', false)
          .order('created_at', { ascending: false })

        setItems(pendingItems || [])
      } else if (activeTab === 'all') {
        const { data: allItems } = await supabase
          .from(TABLES.ITEMS)
          .select(`
            *,
            users:uploader_id(name, email)
          `)
          .order('created_at', { ascending: false })

        setItems(allItems || [])
      } else if (activeTab === 'users') {
        const { data: allUsers } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .order('created_at', { ascending: false })

        setUsers(allUsers || [])
      }
    } catch (err) {
      setError('Failed to load admin data: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const handleApproveItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .update({ 
          approved: true,
          status: 'available'
        })
        .eq('id', itemId)

      if (error) {
        toast.error('Error approving item')
      } else {
        toast.success('Item approved successfully')
        fetchData()
      }
    } catch (error) {
      toast.error('Error approving item')
    }
  }

  const handleRejectItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .delete()
        .eq('id', itemId)

      if (error) {
        toast.error('Error rejecting item')
      } else {
        toast.success('Item rejected and deleted')
        fetchData()
      }
    } catch (error) {
      toast.error('Error rejecting item')
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
        fetchData()
      }
    } catch (error) {
      toast.error('Error deleting item')
    }
  }

  const toggleUserAdmin = async (userId, currentAdminStatus) => {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({ isAdmin: !currentAdminStatus })
        .eq('id', userId)

      if (error) {
        toast.error('Error updating user')
      } else {
        toast.success(`User ${currentAdminStatus ? 'removed from' : 'made'} admin`)
        fetchData()
      }
    } catch (error) {
      toast.error('Error updating user')
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-carob">Admin Panel</h1>
          </div>
          <p className="text-matcha">Manage items, users, and platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-matcha">Total Items</p>
                <p className="text-2xl font-bold text-carob">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-matcha">Pending Items</p>
                <p className="text-2xl font-bold text-carob">{stats.pendingItems}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-matcha">Total Users</p>
                <p className="text-2xl font-bold text-carob">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-matcha">Total Swaps</p>
                <p className="text-2xl font-bold text-carob">{stats.totalSwaps}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
            {[
              { id: 'pending', label: 'Pending Items', count: stats.pendingItems },
              { id: 'all', label: 'All Items' },
              { id: 'users', label: 'Users' }
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
                {tab.count > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Items Tabs */}
          {(activeTab === 'pending' || activeTab === 'all') && (
            <div>
              {items.length === 0 ? (
                <div className="card text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'pending' ? 'No pending items' : 'No items found'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'pending' 
                      ? 'All items have been reviewed.'
                      : 'No items have been uploaded yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="card">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {item.images && item.images[0] ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>by {item.users?.name || 'Anonymous'}</span>
                                <span>{item.users?.email}</span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.category && (
                                  <span className="text-xs bg-matcha text-vanilla px-2 py-1 rounded-full">
                                    {item.category}
                                  </span>
                                )}
                                {item.type && (
                                  <span className="text-xs bg-chai text-vanilla px-2 py-1 rounded-full">
                                    {item.type}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  item.approved 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.approved ? 'Approved' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!item.approved && (
                                <>
                                  <button
                                    onClick={() => handleApproveItem(item.id)}
                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectItem(item.id)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                    title="Reject"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {users.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">No users have registered yet.</p>
                </div>
              ) : (
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name || 'Anonymous'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.points || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isAdmin 
                                  ? 'bg-carob text-vanilla'
                                  : 'bg-pistache text-carob'
                              }`}>
                                {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => toggleUserAdmin(user.id, user.isAdmin)}
                                className={`text-sm px-3 py-1 rounded-full ${
                                  user.isAdmin
                                    ? 'text-red-600 hover:text-red-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                              >
                                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 