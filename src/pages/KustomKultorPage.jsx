import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Calendar, User, Heart, Eye, ArrowRight } from "lucide-react"
import { supabase } from "../lib/supabase"
import ScrollReveal from "../components/ScrollReveal"

export default function KustomKultorPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
    loadCategories()
  }, [selectedCategory])

  const loadPosts = async () => {
    try {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error loading posts:", error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    return { day, month }
  }

  return (
    <>
      <Helmet>
        <title>Blog - Kustom Kultor | Kustom Koats</title>
        <meta name="description" content="Explore automotive inspiration, how-to guides, and industry insights from Kustom Koats." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Header */}
        <section className="relative py-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 text-center">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: "'Rajdhani', sans-serif", 
                color: "#FFFFFF",
                letterSpacing: "0.05em"
              }}
            >
              Blog
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#CCCCCC" }}>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span>Blog</span>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b" style={{ borderColor: "#E5E5E5" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === "all" ? "" : "hover:scale-105"
                }`}
                style={{
                  background: selectedCategory === "all" ? "#FF0000" : "#F8F8F8",
                  color: selectedCategory === "all" ? "#FFFFFF" : "#333333"
                }}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.slug ? "" : "hover:scale-105"
                  }`}
                  style={{
                    background: selectedCategory === cat.slug ? cat.color : "#F8F8F8",
                    color: selectedCategory === cat.slug ? "#FFFFFF" : "#333333"
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg" style={{ color: "#666666" }}>
                  No blog posts available yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, idx) => {
                  const { day, month } = formatDate(post.published_at || post.created_at)
                  const category = categories.find(c => c.slug === post.category)

                  return (
                    <ScrollReveal key={post.id} delay={idx * 0.1}>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="group block"
                      >
                        {/* Featured Image */}
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                          {post.featured_image ? (
                            <img 
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                            >
                              <div className="text-6xl font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                                KK
                              </div>
                            </div>
                          )}

                          {/* Date Badge */}
                          <div 
                            className="absolute top-4 left-4 w-16 h-16 rounded-lg flex flex-col items-center justify-center"
                            style={{ background: "#FFFFFF", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          >
                            <div className="text-2xl font-bold leading-none" style={{ color: "#000000" }}>
                              {day}
                            </div>
                            <div className="text-xs font-bold mt-1" style={{ color: "#FF0000" }}>
                              {month}
                            </div>
                          </div>

                          {/* Category Badge */}
                          {category && (
                            <div 
                              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase"
                              style={{ 
                                background: category.color,
                                color: "#FFFFFF"
                              }}
                            >
                              {category.name}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div>
                          <h3 
                            className="text-xl font-bold mb-3 transition-colors group-hover:text-red-600"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              color: "#000000",
                              lineHeight: "1.4"
                            }}
                          >
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p 
                              className="text-sm mb-4 line-clamp-2"
                              style={{ 
                                fontFamily: "'Inter', sans-serif", 
                                color: "#666666",
                                lineHeight: "1.6"
                              }}
                            >
                              {post.excerpt}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs" style={{ color: "#999999" }}>
                            {post.views > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye size={14} />
                                {post.views}
                              </div>
                            )}
                            {post.likes > 0 && (
                              <div className="flex items-center gap-1">
                                <Heart size={14} />
                                {post.likes}
                              </div>
                            )}
                          </div>

                          {/* Read More */}
                          <div
                            className="inline-flex items-center gap-2 text-sm font-medium mt-4 transition-all group-hover:gap-3"
                            style={{ 
                              fontFamily: "'Inter', sans-serif", 
                              color: "#FF0000"
                            }}
                          >
                            CONTINUE READING
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
