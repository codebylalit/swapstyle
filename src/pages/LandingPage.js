import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Users, Award, TrendingUp } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'

const LandingPage = () => {
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedItems()
  }, [])

  const fetchFeaturedItems = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ITEMS)
        .select(`
          *,
          users:uploader_id(name, avatar_url)
        `)
        .eq('approved', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching featured items:', error)
        return
      }

      setFeaturedItems(data || [])
    } catch (error) {
      console.error('Error fetching featured items:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-primary-600" />,
      title: 'Sustainable Fashion',
      description: 'Reduce waste and promote circular fashion by sharing clothes with your community.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Community Driven',
      description: 'Connect with fashion-conscious individuals who care about the environment.'
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: 'Point System',
      description: 'Earn points for sharing items and redeem them for new pieces you love.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Quality Items',
      description: 'All items are carefully curated and approved by our community moderators.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-primary-600">WearShare</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the sustainable fashion revolution. Share, swap, and discover amazing clothing items 
              while earning points and reducing fashion waste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
              >
                Start Swapping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/browse" 
                className="btn-outline text-lg px-8 py-3"
              >
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose WearShare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building a community that values sustainability, quality, and connection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Items
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing pieces from our community
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="card hover:shadow-lg transition-shadow">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      by {item.users?.name || 'Anonymous'}
                    </span>
                    <Link 
                      to={`/item/${item.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No featured items available yet. Be the first to list an item!
              </p>
              <Link 
                to="/signup" 
                className="btn-primary mt-4 inline-block"
              >
                Join Now
              </Link>
            </div>
          )}

          {featuredItems.length > 0 && (
            <div className="text-center mt-12">
              <Link 
                to="/browse" 
                className="btn-outline text-lg px-8 py-3"
              >
                View All Items
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Sustainable Fashion Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion-conscious individuals who are making a difference 
            one swap at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Get Started
            </Link>
            <Link 
              to="/browse" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Explore Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage 