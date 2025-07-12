import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, TABLES } from '../lib/supabase'
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'

const BrowseItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 12

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
    setLoading(true)
    
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
        console.error('Error fetching items:', error)
        return
      }

      setItems(data || [])
      setTotalItems(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-600">Discover amazing pieces from our community</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items by title, description, or tags..."
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-field"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Search
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-outline"
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
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${totalItems} items found`}
            </p>
            {hasActiveFilters && (
              <span className="text-sm text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
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
                <div key={item.id} className={viewMode === 'grid' ? 'card hover:shadow-lg transition-shadow' : 'card flex space-x-4'}>
                  <div className={viewMode === 'grid' ? 'aspect-w-1 aspect-h-1 mb-4' : 'flex-shrink-0'}>
                    {item.images && item.images[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className={viewMode === 'grid' 
                          ? 'w-full h-48 object-cover rounded-lg'
                          : 'w-24 h-24 object-cover rounded-lg'
                        }
                      />
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center'
                        : 'w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center'
                      }>
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                    <h3 className={`font-semibold text-gray-900 ${viewMode === 'grid' ? 'text-lg mb-2' : 'text-base mb-1'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-gray-600 ${viewMode === 'grid' ? 'text-sm mb-3 line-clamp-2' : 'text-sm mb-2'}`}>
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.category && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      )}
                      {item.type && (
                        <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
                          {item.type}
                        </span>
                      )}
                      {item.size && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {item.size}
                        </span>
                      )}
                    </div>
                    
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
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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