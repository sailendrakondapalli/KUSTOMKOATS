import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Calendar, User, Heart, Eye, ArrowLeft, Share2 } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    loadPost()
  }, [slug])

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (error) throw error
      
      if (data) {
        setPost(data)
        // Increment views
        await supabase
          .from("blog_posts")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id)

        // Load category
        const { data: catData } = await supabase
          .from("blog_categories")
          .select("*")
          .eq("slug", data.category)
          .single()

        if (catData) setCategory(catData)
      }
    } catch (error) {
      console.error("Error loading post:", error)
      navigate("/kustom-kultor")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg" style={{ color: "#666666" }}>Loading...</div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Kustom Koats Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Back Button */}
        <div className="py-6 border-b" style={{ borderColor: "#E5E5E5" }}>
          <div className="max-w-4xl mx-auto px-6">
            <Link 
              to="/kustom-kultor"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-red-600"
              style={{ color: "#666666" }}
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Post Header */}
        <article className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            {/* Category */}
            {category && (
              <div className="mb-4">
                <span 
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ 
                    background: category.color,
                    color: "#FFFFFF"
                  }}
                >
                  {category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ 
                fontFamily: "'Rajdhani', sans-serif", 
                color: "#000000",
                lineHeight: "1.2"
              }}
            >
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p 
                className="text-xl mb-8"
                style={{ 
                  color: "#666666",
                  lineHeight: "1.6"
                }}
              >
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex items-center gap-2 text-sm" style={{ color: "#666666" }}>
                <Calendar size={16} />
                {formatDate(post.published_at || post.created_at)}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: "#666666" }}>
                <Eye size={16} />
                {post.views || 0} views
              </div>
              <button 
                className="flex items-center gap-2 text-sm transition-colors hover:text-red-600"
                style={{ color: "#666666" }}
              >
                <Heart size={16} />
                {post.likes || 0}
              </button>
              <button 
                className="flex items-center gap-2 text-sm transition-colors hover:text-red-600"
                style={{ color: "#666666" }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      url: window.location.href
                    })
                  }
                }}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-12 rounded-lg overflow-hidden">
                <img 
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              style={{
                color: "#333333",
                lineHeight: "1.8"
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>
                {post.content}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts CTA */}
        <section className="py-12 border-t" style={{ borderColor: "#E5E5E5" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Link
              to="/kustom-kultor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              style={{ 
                background: "#FF0000", 
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif" 
              }}
            >
              View More Articles
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
