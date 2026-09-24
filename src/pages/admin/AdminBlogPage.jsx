import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Calendar, Tag } from "lucide-react"

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category: "",
    published: false,
    featured: false
  })

  useEffect(() => {
    loadPosts()
    loadCategories()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error loading posts:", error)
      alert("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const postData = {
        ...formData,
        published_at: formData.published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id)

        if (error) throw error
        alert("Post updated successfully!")
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData])

        if (error) throw error
        alert("Post created successfully!")
      }

      setShowForm(false)
      setEditingPost(null)
      resetForm()
      loadPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      alert(`Failed to save post: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id)

      if (error) throw error
      alert("Post deleted successfully!")
      loadPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      category: post.category,
      published: post.published,
      featured: post.featured
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      category: "",
      published: false,
      featured: false
    })
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `blog/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      // Update form data with the image URL
      setFormData(prev => ({ ...prev, featured_image: publicUrl }))
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleTitleChange = (title) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const togglePublished = async (post) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          published: !post.published,
          published_at: !post.published ? new Date().toISOString() : null
        })
        .eq("id", post.id)

      if (error) throw error
      loadPosts()
    } catch (error) {
      console.error("Error toggling publish status:", error)
      alert("Failed to update publish status")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg" style={{ color: "#666666" }}>Loading blog posts...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#000000" }}>
            Kustom Kultor Blog
          </h1>
          <p style={{ color: "#666666" }}>
            Manage blog posts, articles, and content
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingPost(null)
            resetForm()
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
          style={{ background: "#FF0000", color: "#FFFFFF" }}
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#000000" }}>
              {editingPost ? "Edit Post" : "Create New Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E5E5E5" }}
                  placeholder="Enter post title"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E5E5E5" }}
                  placeholder="url-friendly-slug"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Featured Image
                </label>
                
                {/* Image Preview */}
                {formData.featured_image && (
                  <div className="mb-3">
                    <img 
                      src={formData.featured_image} 
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      style={{ borderColor: "#E5E5E5" }}
                    />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-3">
                  <label className="flex-1">
                    <div 
                      className="w-full px-4 py-3 border rounded-lg cursor-pointer text-center transition-colors"
                      style={{ 
                        borderColor: "#E5E5E5",
                        background: uploading ? "#F5F5F5" : "#FFFFFF",
                        color: uploading ? "#999999" : "#333333"
                      }}
                    >
                      {uploading ? "Uploading..." : "Upload from Device"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL Input (optional) */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg text-sm"
                    style={{ borderColor: "#E5E5E5" }}
                    placeholder="Or paste image URL..."
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E5E5E5" }}
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#333333" }}>
                  Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg"
                  style={{ borderColor: "#E5E5E5" }}
                  rows={12}
                  placeholder="Write your post content here..."
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span style={{ color: "#333333" }}>Publish immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span style={{ color: "#333333" }}>Featured post</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-lg font-medium"
                  style={{ background: "#FF0000", color: "#FFFFFF" }}
                >
                  {editingPost ? "Update Post" : "Create Post"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPost(null)
                    resetForm()
                  }}
                  className="px-8 py-3 rounded-lg font-medium"
                  style={{ background: "#E5E5E5", color: "#333333" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg border" style={{ borderColor: "#E5E5E5" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8F8F8", borderBottom: "1px solid #E5E5E5" }}>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#333333" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: "#999999" }}>
                    No blog posts yet. Click "New Post" to create one.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td className="px-6 py-4">
                      {post.featured_image ? (
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon size={24} style={{ color: "#CCCCCC" }} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: "#000000" }}>{post.title}</div>
                      <div className="text-sm" style={{ color: "#666666" }}>/{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          background: categories.find(c => c.slug === post.category)?.color || "#999999",
                          color: "#FFFFFF"
                        }}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublished(post)}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: post.published ? "#16A34A" : "#E5E5E5",
                          color: post.published ? "#FFFFFF" : "#666666"
                        }}
                      >
                        {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                        {post.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#666666" }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit size={18} style={{ color: "#0984E3" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 size={18} style={{ color: "#FF0000" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
