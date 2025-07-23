import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase, TABLES } from "../lib/supabase";
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
  Plus,
} from "lucide-react";
import Navbar from "../components/Navbar";

const categories = [
  { name: "Tops", icon: <Shirt className="h-8 w-8" />, color: "bg-blue-100" },
  {
    name: "Bottoms",
    icon: <Package className="h-8 w-8" />,
    color: "bg-green-100",
  },
  { name: "Dresses", icon: <Star className="h-8 w-8" />, color: "bg-pink-100" },
  {
    name: "Outerwear",
    icon: <Shield className="h-8 w-8" />,
    color: "bg-purple-100",
  },
  {
    name: "Shoes",
    icon: <Package className="h-8 w-8" />,
    color: "bg-yellow-100",
  },
  {
    name: "Accessories",
    icon: <ShoppingBag className="h-8 w-8" />,
    color: "bg-orange-100",
  },
  { name: "Other", icon: <Star className="h-8 w-8" />, color: "bg-gray-100" },
];

const features = [
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: "Sustainable Fashion",
    description:
      "Reduce waste and give clothes a second life through community sharing.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Community Driven",
    description:
      "Connect with fashion-conscious individuals who care about the environment.",
  },
  {
    icon: <Leaf className="h-8 w-8 text-green-500" />,
    title: "Eco-Friendly",
    description:
      "Make a positive impact on the planet with every swap and exchange.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-purple-500" />,
    title: "Unique Finds",
    description:
      "Discover one-of-a-kind pieces that tell a story and fit your style.",
  },
];

const stats = [
  {
    number: "1000+",
    label: "Items Shared",
    icon: <Shirt className="h-6 w-6" />,
  },
  {
    number: "500+",
    label: "Happy Members",
    icon: <Users className="h-6 w-6" />,
  },
  {
    number: "200+",
    label: "Successful Swaps",
    icon: <Heart className="h-6 w-6" />,
  },
  { number: "50+", label: "Categories", icon: <Star className="h-6 w-6" /> },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    content:
      "WearShare has completely changed how I think about fashion. I love finding unique pieces while helping the environment!",
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Sustainability Advocate",
    content:
      "The community here is amazing. Everyone is so supportive and the quality of items is outstanding.",
    avatar: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Style Blogger",
    content:
      "I've discovered so many amazing pieces through WearShare. It's my go-to platform for sustainable fashion.",
    avatar: "ER",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      setItemsLoading(true);
      const { data, error } = await supabase
        .from(TABLES.ITEMS)
        .select("*")
        .eq("approved", true)
        .eq("status", "available")
        .order("created_at", { ascending: false })
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
            Join our community platform to swap, redeem, and discover
            clothing—making fashion circular, fun, and eco-friendly.
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
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-10 py-5 w-full sm:w-auto flex items-center justify-center gap-3 group"
                >
                  Go to Dashboard
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/browse"
                  className="btn-outline text-lg px-10 py-5 w-full sm:w-auto"
                >
                  Browse Items
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="btn-primary text-lg px-10 py-5 w-full sm:w-auto flex items-center justify-center gap-3 group"
                >
                  Get Started Free
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/browse"
                  className="btn-outline text-lg px-10 py-5 w-full sm:w-auto"
                >
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
              <div
                key={index}
                className="card text-center p-8 slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 flex justify-center text-primary">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-carob mb-2">
                  {stat.number}
                </h3>
                <p className="text-matcha text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">
            Explore Categories
          </h2>
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
                <span className="text-carob font-semibold text-sm">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        {/* Featured Products Grid */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">
            Featured Items
          </h2>
          {itemsLoading ? (
            <div className="flex justify-center py-16">
              <div className="loading-spinner h-16 w-16"></div>
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="card text-center py-16">
              <Star className="h-20 w-20 text-primary-200 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-carob mb-4">
                No featured items yet
              </h3>
              <p className="text-matcha mb-8 text-lg">
                Be the first to list an item and inspire others!
              </p>
              <Link
                to="/add-item"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 mx-auto w-fit"
              >
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
                  <p className="text-matcha text-sm line-clamp-2 mb-4">
                    {item.description}
                  </p>
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
          <h2 className="text-4xl font-bold text-carob text-center mb-12">
            Why Choose WearShare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card card-hover text-center p-8 slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-carob mb-4">
                  {feature.title}
                </h3>
                <p className="text-matcha text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Testimonials Section */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-carob text-center mb-12">
            What Our Community Says
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card card-hover p-8 slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-6">
                  <div className="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-carob text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-matcha">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-matcha italic text-base leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="w-full max-w-xl mx-auto mb-20">
          <div className="bg-white rounded-2xl shadow-2xl border border-matcha/30 p-10 flex flex-col items-center">
            <h2 className="text-3xl font-extrabold text-carob mb-4 text-center">
              Contact Us
            </h2>
            <p className="text-base text-chai text-center mb-4">
              We'd love to hear from you! Whether you have questions, feedback,
              or just want to say hello, our inbox is always open.
            </p>
            <p className="text-lg text-chai text-center mb-2">Email us at</p>
            <a
              href="mailto:visonovaofficial@gmail.com"
              className="text-matcha text-xl font-semibold underline hover:text-primary transition-colors text-center"
            >
              visonovaofficial@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-carob text-vanilla text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row md:justify-between md:items-center gap-8 md:gap-0">
          {/* Left: Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-bold mb-2">WearShare</span>
            <span className="text-vanilla/70 mb-4 md:mb-0 text-center md:text-left">
              Sustainable fashion, made simple.
            </span>
          </div>

          {/* Center: Essential Links */}
          <ul className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
            <li>
              <Link
                to="/browse"
                className="hover:underline text-vanilla/80 hover:text-vanilla transition-colors"
              >
                Browse
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="hover:underline text-vanilla/80 hover:text-vanilla transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-of-service"
                className="hover:underline text-vanilla/80 hover:text-vanilla transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-center text-vanilla/50 py-4 text-xs border-t border-vanilla/10 mt-4">
          © 2025 WearShare. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
