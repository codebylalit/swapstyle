import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES, STORAGE_BUCKETS } from '../lib/supabase'
import { Upload, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const AddItem = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    tags: ''
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const categories = [
    'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'
  ]

  const types = [
    'Casual', 'Formal', 'Business', 'Sportswear', 'Vintage', 'Designer', 'Other'
  ]

  const sizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Custom'
  ]

  const conditions = [
    'New with tags', 'Like new', 'Excellent', 'Good', 'Fair', 'Poor'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploading(true)
    
    try {
      const uploadedUrls = []
      
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error(`${file.name} is too large. Maximum size is 5MB.`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.ITEM_IMAGES)
          .upload(filePath, file)

        if (uploadError) {
          toast.error(`Error uploading ${file.name}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.ITEM_IMAGES)
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setImages(prev => [...prev, ...uploadedUrls])
      toast.success('Images uploaded successfully')
    } catch (error) {
      toast.error('Error uploading images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            type: formData.type,
            size: formData.size,
            condition: formData.condition,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            images: images,
            uploader_id: user.id,
            status: 'available',
            approved: false // Requires admin approval
          }
        ])

      if (error) {
        toast.error('Error creating item')
        console.error('Error:', error)
      } else {
        toast.success('Item created successfully! It will be reviewed by our team.')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error('Error creating item')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List a New Item</h1>
          <p className="text-gray-600">Share your clothes with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Images</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Item ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Add Image</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload up to 5 images. Maximum file size: 5MB each.
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Vintage Denim Jacket"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., vintage, denim, casual (comma separated)"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Describe your item in detail..."
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'List Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem 