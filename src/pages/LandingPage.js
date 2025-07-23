import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabase';
import { 
  ArrowRight, 
  Heart, 
  Users, 
  Leaf, 
  Sparkles, 
  Shirt, 
  Package, 
  Star,
  ShoppingBag, 
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  TrendingUp,
  Shield,
  Clock,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';

const categories = [
  { name: 'Tops', icon: <Shirt className="h-8 w-8" />, color: 'bg-blue-100' },
  { name: 'Bottoms', icon: <Package className="h-8 w-8" />, color: 'bg-green-100' },
  { name: 'Dresses', icon: <Star className="h-8 w-8" />, color: 'bg-pink-100' },
  { name: 'Outerwear', icon: <Shield className="h-8 w-8" />, color: 'bg-purple-100' },
  { name: 'Shoes', icon: <Package className="h-8 w-8" />, color: 'bg-yellow-100' },
  { name: 'Accessories', icon: <ShoppingBag className="h-8 w-8" />, color: 'bg-orange-100' },
  { name: 'Other', icon: <Star className="h-8 w-8" />, color: 'bg-gray-100' }
];

const features = [
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: 'Sustainable Fashion',
    description: 'Reduce waste and give clothes a second life through community sharing.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
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

const stats = [
  { number: '1000+', label: 'Items Shared', icon: <Shirt className="h-6 w-6" /> },
  { number: '500+', label: 'Happy Members', icon: <Users className="h-6 w-6" /> },
  { number: '200+', label: 'Successful Swaps', icon: <Heart className="h-6 w-6" /> },
  { number: '50+', label: 'Categories', icon: <Star className="h-6 w-6" /> }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    content: 'WearShare has completely changed how I think about fashion. I love finding unique pieces while helping the environment!',
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Sustainability Advocate',
    content: 'The community here is amazing. Everyone is so supportive and the quality of items is outstanding.',
    avatar: 'MC'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Style Blogger',
    content: 'I\'ve discovered so many amazing pieces through WearShare. It\'s my go-to platform for sustainable fashion.',
    avatar: 'ER'
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
    <div className="min-h-screen bg-almond">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-secondary rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-primary rounded-full"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="badge badge-primary text-sm font-medium px-6 py-3 flex items-center gap-2 mx-auto w-fit">
              <Leaf className="h-5 w-5" />
              Sustainable Fashion Community
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-carob mb-8 leading-tight">
            Refresh Your Closet, Sustainably
          </h1>
          
          <p className="text-xl md:text-2xl text-matcha mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our community platform to swap, redeem, and discover clothing—making fashion circular, fun, and eco-friendly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 w-full max-w-lg mx-auto">
            {loading ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-lg px-10 py-5 w-full sm:w-auto flex items-center justify-center gap-3 group">
                  Go to Dashboard
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="btn-outline text-lg px-10 py-5 w-full sm:w-auto">
                  Browse Items
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-lg px-10 py-5 w-full sm:w-auto flex items-center justify-center gap-3 group">
                  Get Started Free
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="btn-outline text-lg px-10 py-5 w-full sm:w-auto">
                  Browse Items
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="card text-center p-8 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-4 flex justify-center text-primary">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-carob mb-2">{stat.number}</h3>
                <p className="text-matcha text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Category Grid */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to="/browse" 
                className="card card-hover p-8 flex flex-col items-center justify-center cursor-pointer text-center group transition-all duration-300 hover:scale-105"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </div>
                <span className="text-carob font-semibold text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
 {/* Featured Products Grid */}
 <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">Featured Items</h2>
          {itemsLoading ? (
            <div className="flex justify-center py-16">
              <div className="loading-spinner h-16 w-16"></div>
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="card text-center py-16">
              <Star className="h-20 w-20 text-primary-200 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-carob mb-4">No featured items yet</h3>
              <p className="text-matcha mb-8 text-lg">Be the first to list an item and inspire others!</p>
              <Link to="/add-item" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto w-fit">
                <Plus className="h-5 w-5" />
                <span>List Your First Item</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredItems.map((item, i) => (
                <Link
                  to={`/item/${item.id}`}
                  key={item.id}
                  className="card card-hover group scale-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="aspect-square mb-6 overflow-hidden rounded-lg bg-primary-50">
                    {item.images && item.images[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="h-16 w-16 text-primary-200" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-carob mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-matcha text-sm line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary">{item.category}</span>
                    <span className="text-xs text-chai">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">Why Choose WearShare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover text-center p-8 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-6 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-carob mb-4">{feature.title}</h3>
                <p className="text-matcha text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Testimonials Section */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card card-hover p-8 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center mb-6">
                  <div className="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-carob text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-matcha">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-matcha italic text-base leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="w-full max-w-xl mx-auto mb-20">
          <form className="bg-chai/60 rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-carob mb-2">Contact Us</h2>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-name" className="text-chai text-base font-medium">Name</label>
              <input id="contact-name" name="name" type="text" className="rounded-lg border-none bg-white px-4 py-3 text-carob focus:ring-2 focus:ring-matcha placeholder-chai/60" placeholder="Name" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-email" className="text-chai text-base font-medium">Email</label>
              <input id="contact-email" name="email" type="email" className="rounded-lg border-none bg-white px-4 py-3 text-carob focus:ring-2 focus:ring-matcha placeholder-chai/60" placeholder="Email" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-subject" className="text-chai text-base font-medium">Subject</label>
              <input id="contact-subject" name="subject" type="text" className="rounded-lg border-none bg-white px-4 py-3 text-carob focus:ring-2 focus:ring-matcha placeholder-chai/60" placeholder="Subject" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-message" className="text-chai text-base font-medium">Message</label>
              <textarea id="contact-message" name="message" rows={4} className="rounded-lg border-none bg-white px-4 py-3 text-carob focus:ring-2 focus:ring-matcha placeholder-chai/60 resize-none" placeholder="Message" />
            </div>
            <button type="submit" className="mt-2 bg-matcha text-vanilla font-semibold text-lg py-3 rounded-lg shadow-md hover:bg-matcha/90 transition-colors">Send Message</button>
          </form>
        </div>

       
      </section>

      {/* Footer */}
      <footer className="bg-carob text-vanilla">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-bold mb-6">WearShare</h3>
              <p className="text-vanilla/80 mb-8 max-w-md text-lg leading-relaxed">
                Making fashion sustainable through community-driven clothing exchange. 
                Join thousands of members who are reducing waste and discovering unique style.
              </p>
              {/* <div className="flex space-x-6">
                <a href="#" className="text-vanilla/80 hover:text-vanilla transition-colors p-2 hover:bg-vanilla/10 rounded-lg">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-vanilla/80 hover:text-vanilla transition-colors p-2 hover:bg-vanilla/10 rounded-lg">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-vanilla/80 hover:text-vanilla transition-colors p-2 hover:bg-vanilla/10 rounded-lg">
                  <Facebook className="h-6 w-6" />
                </a>
              </div> */}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link to="/browse" className="text-vanilla/80 hover:text-vanilla transition-colors text-lg">Browse Items</Link></li>
                <li><Link to="/add-item" className="text-vanilla/80 hover:text-vanilla transition-colors text-lg">List an Item</Link></li>
                <li><Link to="/dashboard" className="text-vanilla/80 hover:text-vanilla transition-colors text-lg">Dashboard</Link></li>
              </ul>
            </div>

            {/* Contact Info
            <div>
              <h4 className="text-xl font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center text-vanilla/80">
                  <Mail className="h-5 w-5 mr-3" />
                  <span className="text-lg">hello@wearshare.com</span>
                </li>
                <li className="flex items-center text-vanilla/80">
                  <Phone className="h-5 w-5 mr-3" />
                  <span className="text-lg">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center text-vanilla/80">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span className="text-lg">San Francisco, CA</span>
                </li>
              </ul>
            </div> */}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-vanilla/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-vanilla/60 text-base">
              © 2025 WearShare. All rights reserved.
            </p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-vanilla/60 hover:text-vanilla text-base transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-vanilla/60 hover:text-vanilla text-base transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 