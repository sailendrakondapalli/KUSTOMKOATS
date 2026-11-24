import { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import axios from 'axios';
import KKAdminLayout from '../../components/admin/KKAdminLayout';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminCategoryShowcasePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [uploadingImage, setUploadingImage] = useState(null);
  const [viewingProducts, setViewingProducts] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, categoryId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    setUploadingImage(categoryId);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `category-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `categories/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully. Public URL:', publicUrl);

      // Update category via backend API (bypasses RLS)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please log in to perform this action');
      }

      const updateRes = await axios.put(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        { image_url: publicUrl },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      console.log('Database updated successfully:', updateRes.data);

      toast.success('Image uploaded and saved!');
      
      // Refresh categories to show the new image
      await fetchCategories();
    } catch (err) {
      console.error('Complete upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(null);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleUpdateName = async (categoryId, newName) => {
    if (!newName.trim()) {
      return toast.error('Category name cannot be empty');
    }

    setSaving(prev => ({ ...prev, [categoryId]: true }));
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Please log in to perform this action');
      }

      await axios.put(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        { name: newName.trim() },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      toast.success('Category name updated!');
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.error || 'Failed to update category name');
    } finally {
      setSaving(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleViewProducts = async (category) => {
    setViewingProducts(category.name);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.name)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategoryProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  if (loading) {
    return (
      <KKAdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </KKAdminLayout>
    );
  }

  return (
    <KKAdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Showcase Management</h1>
          <p className="text-gray-600">
            Manage category names and images. Click "View Products" to see all products in each category.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image Section */}
              <div className="relative aspect-square bg-gray-100">
                {category.image_url ? (
                  <img 
                    src={`${category.image_url}?t=${Date.now()}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    key={category.image_url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
                
                {/* Upload Button Overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 transition-all cursor-pointer group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3">
                    {uploadingImage === category.id ? (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload size={24} className="text-blue-600" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, category.id)}
                    disabled={uploadingImage === category.id}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Info Section */}
              <div className="p-4">
                {/* Category Name (Editable) */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      const newCategories = categories.map(cat => 
                        cat.id === category.id ? { ...cat, name: e.target.value } : cat
                      );
                      setCategories(newCategories);
                    }}
                    onBlur={(e) => {
                      if (e.target.value !== category.name) {
                        handleUpdateName(category.id, e.target.value);
                      }
                    }}
                    disabled={saving[category.id]}
                    className="w-full text-lg font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none px-2 py-1 transition-colors"
                  />
                </div>

                {/* View Products Button */}
                <button
                  onClick={() => handleViewProducts(category)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Eye size={16} />
                  View Products
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Modal */}
      {viewingProducts && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingProducts(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{viewingProducts} - Products</h2>
              <button
                onClick={() => setViewingProducts(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {categoryProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No products found in this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100">
                        <img 
                          src={product.images?.[0] || '/categories/image.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/categories/image.png';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                        {product.price && (
                          <p className="text-sm font-bold text-gray-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        )}
                        {product.stock !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {product.stock}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </KKAdminLayout>
  );
}
