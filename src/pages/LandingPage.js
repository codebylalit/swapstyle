import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabase';
import { ArrowRight, Heart, Users, Leaf, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const categories = [
  { name: 'Tops', icon: '👕', color: 'bg-blue-100' },
  { name: 'Bottoms', icon: '👖', color: 'bg-green-100' },
  { name: 'Dresses', icon: '👗', color: 'bg-pink-100' },
  { name: 'Outerwear', icon: '🧥', color: 'bg-purple-100' },
  { name: 'Shoes', icon: '👠', color: 'bg-yellow-100' },
  { name: 'Accessories', icon: '👜', color: 'bg-orange-100' },
  { name: 'Other', icon: '🎽', color: 'bg-gray-100' }
];

const features = [
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: 'Sustainable Fashion',
    description: 'Reduce waste and give clothes a second life through community sharing.'
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: 'Community Driven',
    description: 'Connect with fashion-conscious individuals who care about the environment.'
  },
  {
    icon: <Leaf className="h-8 w-8 text-green-500" />,
    title: 'Eco-Friendly',
    description: 'Make a positive impact on the planet with every swap and exchange.'
  },
  {
    icon: <Sparkles className="h-8 w-8 text-purple-500" />,
    title: 'Unique Finds',
    description: 'Discover one-of-a-kind pieces that tell a story and fit your style.'
  }
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      setItemsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.ITEMS)
        .select('*')
        .eq('approved', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(8);
      setFeaturedItems(data || []);
      setItemsLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-almond via-vanilla to-almond">
      <Navbar />
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center py-20 px-4 sm:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-secondary rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-primary rounded-full"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="badge-primary text-sm font-medium px-4 py-2">
              🌱 Sustainable Fashion Community
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-carob mb-6 leading-tight">
            Refresh Your Closet,{' '}
            <span className="text-gradient">Sustainably</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-matcha mb-8 max-w-3xl mx-auto leading-relaxed">
            Join our community platform to swap, redeem, and discover clothing—making fashion circular, fun, and eco-friendly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 w-full max-w-md mx-auto">
            {loading ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="btn-outline text-lg px-8 py-4 w-full sm:w-auto">
                  Browse Items
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="btn-outline text-lg px-8 py-4 w-full sm:w-auto">
                  Browse Items
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center p-6 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-carob mb-2">{feature.title}</h3>
                <p className="text-matcha text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className="w-full max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-carob text-center mb-8">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/browse?category=${cat.name}`}
                className="card-interactive p-6 flex flex-col items-center justify-center text-center group"
              >
                <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  {cat.icon}
                </div>
                <span className="text-carob font-semibold text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-carob text-center mb-8">Featured Items</h2>
          {itemsLoading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner h-12 w-12"></div>
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">👗</div>
              <h3 className="text-xl font-semibold text-carob mb-2">No featured items yet</h3>
              <p className="text-matcha mb-6">Be the first to list an item and inspire others!</p>
              <Link to="/add-item" className="btn-primary">
                List Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredItems.map((item, i) => (
                <Link
                  to={`/item/${item.id}`}
                  key={item.id}
                  className="card-interactive group scale-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                    {item.images && item.images[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">👕</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-carob mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-matcha text-sm line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="badge-primary">{item.category}</span>
                    <span className="text-xs text-chai">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 