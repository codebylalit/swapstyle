import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TABLES, STORAGE_BUCKETS } from '../lib/supabase'
import { Upload, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ErrorMessage from '../components/ErrorMessage';

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
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError('Error uploading images: ' + (err.message || err));
      toast.error('Error uploading images');
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
        setError(error.message || 'Error creating item');
        toast.error('Error creating item');
        console.error('Error:', error)
      } else {
        toast.success('Item created successfully! It will be reviewed by our team.')
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Error creating item: ' + (err.message || err));
      toast.error('Error creating item');
      console.error('Error:', err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-almond py-12">
      <ErrorMessage message={error} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2">List a New Item</h1>
          <p className="text-matcha text-lg">Share your clothes with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Image Upload Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Item Images</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Item ${index + 1}`}
                      className="w-full h-36 object-cover rounded-2xl shadow-soft"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="border-2 border-dashed border-primary-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors bg-primary-50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="loading-spinner h-10 w-10"></div>
                    ) : (
                      <>
                        <Upload className="h-7 w-7 text-primary mb-2" />
                        <span className="text-chai text-base">Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <p className="text-sm text-chai">Up to 5 images. Max 5MB each.</p>
            </div>
          </div>

          {/* Item Details Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-chai font-semibold mb-2">Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field text-base"
                  placeholder="e.g. Blue Denim Jacket"
                  required
                />
              </div>
              <div>
                <label className="block text-chai font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select-field text-base"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-chai font-semibold mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="select-field text-base"
                >
                  <option value="">Select type</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-chai font-semibold mb-2">Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="select-field text-base"
                >
                  <option value="">Select size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-chai font-semibold mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="select-field text-base"
                >
                  <option value="">Select condition</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-chai font-semibold mb-2">Tags</label>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field text-base"
                  placeholder="e.g. summer, casual, blue"
                />
                <p className="text-sm text-chai mt-2">Comma separated</p>
              </div>
            </div>
            <div>
              <label className="block text-chai font-semibold mb-2 mt-6">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea-field text-base"
                placeholder="Describe your item..."
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-end">
            <button
              type="submit"
              className="btn-primary flex items-center gap-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner h-6 w-6"></div>
              ) : (
                <>
                  <Plus className="h-6 w-6" />
                  <span>List Item</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-outline text-lg"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem 