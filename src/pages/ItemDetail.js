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
      <div className="min-h-screen flex items-center justify-center bg-almond">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-almond">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-carob mb-2">Item not found</h2>
          <p className="text-matcha mb-6">The item you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-almond py-8 w-full px-4 sm:px-8">
      <div className="w-full max-w-6xl mx-auto px-0 sm:px-0">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/browse')}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="card">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-primary-50">
              {item.images && item.images.length > 0 ? (
                <>
                  <img 
                    src={item.images[currentImageIndex]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-soft"
                      >
                        <ChevronLeft className="h-5 w-5 text-carob" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-soft"
                      >
                        <ChevronRight className="h-5 w-5 text-carob" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {item.images.length}
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-primary-200 text-6xl">👕</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-primary-300'
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
            <div className="card">
              <h1 className="text-3xl font-bold text-carob mb-4">{item.title}</h1>
              <p className="text-matcha text-lg mb-6 leading-relaxed">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">Category</label>
                  <span className="badge badge-primary">{item.category}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">Type</label>
                  <span className="badge badge-secondary">{item.type || 'Not specified'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">Size</label>
                  <span className="badge badge-success">{item.size || 'Not specified'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chai mb-1">Condition</label>
                  <span className="badge badge-warning">{item.condition || 'Not specified'}</span>
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-chai mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-chai">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {new Date(item.created_at).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {/* Uploader Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-carob mb-4">Listed by</h3>
              <div className="flex items-center space-x-4">
                {uploader?.avatar_url ? (
                  <img 
                    src={uploader.avatar_url} 
                    alt={uploader.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-carob">{uploader?.name || 'Anonymous'}</p>
                  <p className="text-sm text-matcha">Community Member</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user && item.uploader_id !== user.id && item.status === 'available' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-carob mb-4">Get this item</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleSwapRequest}
                    disabled={swapLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {swapLoading ? (
                      <div className="loading-spinner h-5 w-5"></div>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5" />
                        <span>Request Swap</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRedemption}
                    disabled={redemptionLoading || (userProfile?.points || 0) < 50}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    {redemptionLoading ? (
                      <div className="loading-spinner h-5 w-5"></div>
                    ) : (
                      <>
                        <Heart className="h-5 w-5" />
                        <span>Redeem with 50 points</span>
                      </>
                    )}
                  </button>
                  
                  {userProfile && userProfile.points < 50 && (
                    <p className="text-sm text-chai text-center">
                      You need {50 - userProfile.points} more points to redeem this item
                    </p>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <div className="card text-center">
                <h3 className="text-lg font-semibold text-carob mb-4">Want this item?</h3>
                <p className="text-matcha mb-4">Sign in to request a swap or redeem with points</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="btn-outline"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail 