import { useState, useEffect } from 'react';
import { Check, X, Search, AlertCircle } from 'lucide-react';
import axios from 'axios';
import KKAdminLayout from '../../components/admin/KKAdminLayout';
import { supabase } from '../../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminCategoryShowcasePage() {
  const [showcases, setShowcases] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState(null);

  const categories = ['Xtreme Kolorz', 'Xtreme Wrap', 'Accessories'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch existing showcases
      try {
        const showcaseRes = await axios.get(`${API_BASE_URL}/api/category-showcase`);
        const showcaseMap = {};
        (showcaseRes.data.data || []).forEach(item => {
          showcaseMap[item.category] = item;
        });
        setShowcases(showcaseMap);
      } catch (err) {
        // category_showcase table doesn't exist - that's okay, show message
        console.warn('category_showcase table not ready:', err);
        showMessage('Category showcase table not found. Run migration037.sql to enable featured products.', 'error');
      }

      // Fetch all products
      const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetShowcase = async (category, productId) => {
    try {
      setSaving(prev => ({ ...prev, [category]: true }));
      
      // Get the current session token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        showMessage('Please log in to perform this action', 'error');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/category-showcase`,
        { category, product_id: productId },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      showMessage(`Successfully set showcase for ${category}`, 'success');
      await fetchData();
    } catch (error) {
      console.error('Error setting showcase:', error);
      showMessage(error.response?.data?.message || 'Failed to set showcase', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleRemoveShowcase = async (category) => {
    try {
      setSaving(prev => ({ ...prev, [category]: true }));
      
      // Get the current session token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        showMessage('Please log in to perform this action', 'error');
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/category-showcase/${category}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      showMessage(`Removed showcase for ${category}, reverted to automatic`, 'success');
      await fetchData();
    } catch (error) {
      console.error('Error removing showcase:', error);
      showMessage(error.response?.data?.message || 'Failed to remove showcase', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [category]: false }));
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div className="max-w-7xl mx-auto">{/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Showcase Management</h1>
          <p className="text-gray-600">
            Select which products to display in the homepage category showcase section. 
            If no product is selected, the most recent product from each category will be shown automatically.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <AlertCircle size={20} />
            <span>{message.text}</span>
          </div>
        )}

        {/* Current Showcases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map(category => {
            const showcase = showcases[category];
            const product = showcase?.products;
            
            return (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-lg">{category}</h3>
                  <p className="text-sm text-gray-500">
                    {product ? 'Custom Selection' : 'Automatic (Most Recent)'}
                  </p>
                </div>
                
                {product ? (
                  <div>
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
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      {product.price && (
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      )}
                      <button
                        onClick={() => handleRemoveShowcase(category)}
                        disabled={saving[category]}
                        className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        {saving[category] ? 'Removing...' : 'Revert to Automatic'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-gray-500 text-center py-8">
                      No custom product selected.<br />
                      Showing most recent product automatically.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Products</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
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
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  {product.price && (
                    <p className="text-sm font-bold text-gray-900 mb-2">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="space-y-1">
                    {categories.map(category => {
                      const isSelected = showcases[category]?.product_id === product.id;
                      
                      return (
                        <button
                          key={category}
                          onClick={() => handleSetShowcase(category, product.id)}
                          disabled={saving[category] || isSelected}
                          className={`w-full py-1.5 px-2 text-xs rounded transition-colors flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          {isSelected ? `Selected for ${category}` : `Set for ${category}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </KKAdminLayout>
  );
}
