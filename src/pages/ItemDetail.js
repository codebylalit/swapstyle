import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES } from '../lib/supabase'
import { 
  User, 
  Calendar, 
  Tag, 
  Heart, 
  MessageSquare, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const ItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  
  const [item, setItem] = useState(null)
  const [uploader, setUploader] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swapLoading, setSwapLoading] = useState(false)
  const [redemptionLoading, setRedemptionLoading] = useState(false)

  useEffect(() => {
    fetchItemDetails()
  }, [id])

  const fetchItemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ITEMS)
        .select(`
          *,
          users:uploader_id(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching item:', error)
        toast.error('Item not found')
        navigate('/browse')
        return
      }

      setItem(data)
      setUploader(data.users)
    } catch (error) {
      console.error('Error fetching item:', error)
      toast.error('Error loading item')
    } finally {
      setLoading(false)
    }
  }

  const handleSwapRequest = async () => {
    if (!user) {
      toast.error('Please log in to request a swap')
      return
    }

    if (item.uploader_id === user.id) {
      toast.error('You cannot swap with yourself')
      return
    }

    setSwapLoading(true)
    
    try {
      const { error } = await supabase
        .from(TABLES.SWAPS)
        .insert([
          {
            item_id: item.id,
            requester_id: user.id,
            owner_id: item.uploader_id,
            status: 'pending'
          }
        ])

      if (error) {
        toast.error('Error requesting swap')
      } else {
        toast.success('Swap request sent! The owner will be notified.')
      }
    } catch (error) {
      toast.error('Error requesting swap')
    } finally {
      setSwapLoading(false)
    }
  }

  const handleRedemption = async () => {
    if (!user) {
      toast.error('Please log in to redeem this item')
      return
    }

    if (item.uploader_id === user.id) {
      toast.error('You cannot redeem your own item')
      return
    }

    const pointsNeeded = 50 // You can adjust this based on your point system
    if (userProfile.points < pointsNeeded) {
      toast.error(`You need ${pointsNeeded} points to redeem this item`)
      return
    }

    setRedemptionLoading(true)
    
    try {
      // Create redemption record
      const { error: redemptionError } = await supabase
        .from(TABLES.REDEMPTIONS)
        .insert([
          {
            item_id: item.id,
            redeemer_id: user.id,
            points_used: pointsNeeded,
            status: 'pending'
          }
        ])

      if (redemptionError) {
        toast.error('Error redeeming item')
        return
      }

      // Update item status
      const { error: itemError } = await supabase
        .from(TABLES.ITEMS)
        .update({ status: 'redeemed' })
        .eq('id', item.id)

      if (itemError) {
        toast.error('Error updating item status')
        return
      }

      // Deduct points from user
      const { error: userError } = await supabase
        .from(TABLES.USERS)
        .update({ points: userProfile.points - pointsNeeded })
        .eq('id', user.id)

      if (userError) {
        toast.error('Error updating points')
        return
      }

      toast.success('Item redeemed successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Error redeeming item')
    } finally {
      setRedemptionLoading(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === item.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? item.images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/browse')}
            className="btn-primary"
          >
            Browse Items
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Browse</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              {item.images && item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <p className="text-gray-600 text-lg">{item.description}</p>
            </div>

            {/* Uploader Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {uploader?.avatar_url ? (
                <img 
                  src={uploader.avatar_url} 
                  alt={uploader.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{uploader?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">Listed {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Item Specifications */}
            <div className="grid grid-cols-2 gap-4">
              {item.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{item.category}</p>
                </div>
              )}
              {item.type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{item.type}</p>
                </div>
              )}
              {item.size && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <p className="text-gray-900">{item.size}</p>
                </div>
              )}
              {item.condition && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <p className="text-gray-900">{item.condition}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  item.status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : item.status === 'swapped'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {item.status === 'available' && (
              <div className="space-y-3">
                <button
                  onClick={handleSwapRequest}
                  disabled={swapLoading || !user || item.uploader_id === user.id}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {swapLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5" />
                      <span>Request Swap</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleRedemption}
                  disabled={redemptionLoading || !user || item.uploader_id === user.id || (userProfile?.points || 0) < 50}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  {redemptionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      <span>Redeem with 50 Points</span>
                    </>
                  )}
                </button>
                
                {!user && (
                  <p className="text-sm text-gray-600 text-center">
                    Please log in to interact with this item
                  </p>
                )}
                
                {user && item.uploader_id === user.id && (
                  <p className="text-sm text-gray-600 text-center">
                    This is your item
                  </p>
                )}
                
                {user && userProfile?.points < 50 && (
                  <p className="text-sm text-gray-600 text-center">
                    You need 50 points to redeem items
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail 