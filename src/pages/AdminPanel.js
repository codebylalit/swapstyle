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
  ArrowLeft,
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import ErrorMessage from '../components/ErrorMessage'

const AdminPanel = () => {
  const { user, userProfile } = useAuth()
  const [pendingItems, setPendingItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userProfile?.isAdmin) {
      fetchAdminData()
    }
  }, [userProfile])

  const fetchAdminData = async () => {
    try {
      // Fetch pending items
      const { data: itemsData, error: itemsError } = await supabase
        .from(TABLES.ITEMS)
        .select(`
          *,
          users:uploader_id(name, email)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false })

      if (itemsError) {
        setError(itemsError.message || 'Error fetching pending items');
      } else {
        setPendingItems(itemsData || [])
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        setError(usersError.message || 'Error fetching users');
      } else {
        setUsers(usersData || [])
      }
    } catch (err) {
      setError('Error fetching admin data: ' + (err.message || err));
    } finally {
      setLoading(false)
    }
  }

  const handleApproveItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .update({ approved: true })
        .eq('id', itemId)

      if (error) {
        toast.error('Error approving item')
      } else {
        toast.success('Item approved successfully')
        fetchAdminData()
      }
    } catch (error) {
      toast.error('Error approving item')
    }
  }

  const handleRejectItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to reject this item?')) return

    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .delete()
        .eq('id', itemId)

      if (error) {
        toast.error('Error rejecting item')
      } else {
        toast.success('Item rejected and deleted')
        fetchAdminData()
      }
    } catch (error) {
      toast.error('Error rejecting item')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', userId)

      if (error) {
        toast.error('Error deleting user')
      } else {
        toast.success('User deleted successfully')
        fetchAdminData()
      }
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const getStats = () => {
    const totalUsers = users.length
    const totalItems = users.reduce((sum, user) => sum + (user.items_count || 0), 0)
    const pendingCount = pendingItems.length
    const activeUsers = users.filter(user => user.last_sign_in_at).length

    return { totalUsers, totalItems, pendingCount, activeUsers }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-almond">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!userProfile?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-almond">
        <div className="card text-center py-12">
          <Shield className="h-16 w-16 text-primary-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-carob mb-2">Access Denied</h2>
          <p className="text-matcha mb-6">You don't have permission to access the admin panel.</p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-almond py-8 w-full px-4 sm:px-8">
      <ErrorMessage message={error} />
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-0">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-carob">Admin Panel</h1>
            <p className="text-matcha">Manage users, items, and platform settings</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="btn-ghost flex items-center gap-2 mt-4 sm:mt-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-carob">{stats.totalUsers}</h3>
            <p className="text-matcha">Total Users</p>
          </div>
          <div className="card text-center">
            <Package className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-carob">{stats.totalItems}</h3>
            <p className="text-matcha">Total Items</p>
          </div>
          <div className="card text-center">
            <Activity className="h-8 w-8 text-warning mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-carob">{stats.pendingCount}</h3>
            <p className="text-matcha">Pending Items</p>
          </div>
          <div className="card text-center">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-carob">{stats.activeUsers}</h3>
            <p className="text-matcha">Active Users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-primary-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pending', label: 'Pending Items' },
              { id: 'users', label: 'Users' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-chai hover:text-carob hover:border-primary-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-carob mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {pendingItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-carob">{item.title}</p>
                        <p className="text-sm text-matcha">by {item.users?.name || 'Unknown'}</p>
                      </div>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                  ))}
                  {pendingItems.length === 0 && (
                    <p className="text-matcha text-center py-8">No pending items</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-carob mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Review Pending Items</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Items Tab */}
          {activeTab === 'pending' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-carob">Pending Items</h3>
                <span className="badge badge-warning">{pendingItems.length} items</span>
              </div>
              
              {pendingItems.length === 0 ? (
                <div className="card text-center py-12">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-carob mb-2">All caught up!</h3>
                  <p className="text-matcha">No items are waiting for approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="card card-hover scale-in">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {item.images && item.images[0] ? (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-primary-50 rounded-lg flex items-center justify-center">
                              <span className="text-primary-200 text-2xl">👕</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-carob">{item.title}</h4>
                          <p className="text-sm text-matcha line-clamp-2">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-chai">
                              by {item.users?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-chai">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveItem(item.id)}
                            className="btn-primary flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectItem(item.id)}
                            className="btn-danger flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-carob">User Management</h3>
                <span className="badge badge-primary">{users.length} users</span>
              </div>
              
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-4 font-medium text-chai">User</th>
                        <th className="text-left py-3 px-4 font-medium text-chai">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-chai">Points</th>
                        <th className="text-left py-3 px-4 font-medium text-chai">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-chai">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-chai">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-medium text-carob">{user.name || 'Anonymous'}</p>
                                {user.isAdmin && (
                                  <span className="badge badge-primary text-xs">Admin</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-matcha">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-carob">{user.points || 0}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${
                              user.last_sign_in_at ? 'badge-success' : 'badge-secondary'
                            }`}>
                              {user.last_sign_in_at ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-chai">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn-ghost text-red-600 hover:text-red-700"
                              disabled={user.isAdmin}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 