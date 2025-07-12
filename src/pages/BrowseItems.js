import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, TABLES } from '../lib/supabase'
import { Search, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import ErrorMessage from '../components/ErrorMessage';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState(null);
  const itemsPerPage = 12

  // Initialize search term and category from URL parameter
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlCategory = searchParams.get('category')
    if (urlSearch) setSearchTerm(urlSearch)
    if (urlCategory) setSelectedCategory(urlCategory)
  }, [searchParams])

  const categories = [
    'All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'
  ]

  const types = [
    'All', 'Casual', 'Formal', 'Business', 'Sportswear', 'Vintage', 'Designer', 'Other'
  ]

  useEffect(() => {
    fetchItems()
  }, [searchTerm, selectedCategory, selectedType, currentPage])

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from(TABLES.ITEMS)
        .select(`
          *,
          users:uploader_id(name, avatar_url)
        `, { count: 'exact' })
        .eq('approved', true)
        .eq('status', 'available')

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      }

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }

      // Apply type filter
      if (selectedType && selectedType !== 'All') {
        query = query.eq('type', selectedType)
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        setError(error.message || 'Error fetching items');
        return;
      }

      setItems(data || [])
      setTotalItems(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (err) {
      setError('Error fetching items: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchItems()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedType('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== 'All') || (selectedType && selectedType !== 'All')

  return (
    <div className="min-h-screen bg-almond py-12 w-full px-4 sm:px-8">
      <ErrorMessage message={error} />
      <div className="w-full max-w-5xl mx-auto px-0 sm:px-0">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl text-carob font-bold mb-2">Browse Items</h1>
          <p className="text-matcha text-lg">Discover amazing pieces from our community</p>
        </div>
        {/* Search and Filters */}
        <div className="card mb-10 w-full">
          <form onSubmit={handleSearch} className="space-y-8 w-full">
            {/* Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items by title, description, or tags..."
                className="input-field pl-5 pr-14 py-4 text-lg"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <Search className="h-6 w-6 text-primary-400" />
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-medium text-chai mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select-field text-base"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-chai mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="select-field text-base"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 text-lg"
                >
                  Search
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-outline text-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-chai">
              {loading ? 'Loading...' : `${totalItems} items found`}
            </p>
            {hasActiveFilters && (
              <span className="badge badge-primary">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-chai hover:text-primary-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-chai hover:text-primary-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner h-12 w-12"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-12">
            <Search className="h-12 w-12 text-primary-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-carob mb-2">No items found</h3>
            <p className="text-chai mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or clear filters.'
                : 'Be the first to list an item!'
              }
            </p>
            {!hasActiveFilters && (
              <Link to="/add-item" className="btn-primary">
                List an Item
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {items.map((item) => (
                <div key={item.id} className={viewMode === 'grid' ? 'card card-hover scale-in' : 'card flex space-x-4 card-hover scale-in'}>
                  <div className={viewMode === 'grid' ? 'aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100' : 'flex-shrink-0'}>
                    {item.images && item.images[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className={viewMode === 'grid' 
                          ? 'w-full h-full object-cover rounded-lg'
                          : 'w-24 h-24 object-cover rounded-lg'
                        }
                      />
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? 'w-full h-full bg-primary-50 rounded-lg flex items-center justify-center'
                        : 'w-24 h-24 bg-primary-50 rounded-lg flex items-center justify-center'
                      }>
                        <span className="text-primary-200 text-3xl">👕</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                    <h3 className={`font-semibold text-carob ${viewMode === 'grid' ? 'text-lg mb-2' : 'text-base mb-1'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-matcha ${viewMode === 'grid' ? 'text-sm mb-3 line-clamp-2' : 'text-sm mb-2'}`}>
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.category && (
                        <span className="badge badge-primary">
                          {item.category}
                        </span>
                      )}
                      {item.type && (
                        <span className="badge badge-secondary">
                          {item.type}
                        </span>
                      )}
                      {item.size && (
                        <span className="badge badge-success">
                          {item.size}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-chai">
                        by {item.users?.name || 'Anonymous'}
                      </span>
                      <Link 
                        to={`/item/${item.id}`}
                        className="btn-ghost text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-chai hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-chai">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-chai hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BrowseItems 