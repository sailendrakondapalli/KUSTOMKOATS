import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { X, Play } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function GalleryPage() {
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // all, images, videos
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Supabase error loading gallery:', error)
        toast.error(`Failed to load gallery: ${error.message}`)
        throw error
      }

      console.log('Loaded gallery items from database:', data)
      setGalleryItems(data || [])
    } catch (error) {
      console.error('Error loading gallery:', error)
      // Fallback to sample data if database is not set up
      setGalleryItems([
        { id: 1, media_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80', category: 'Events', title: 'Event 1', media_type: 'image' },
        { id: 2, media_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', category: 'Training', title: 'Training Session', media_type: 'image' },
        { id: 3, media_url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', category: 'Events', title: 'Event 2', media_type: 'image' },
        { id: 4, media_url: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80', category: 'Facilities', title: 'Our Facility', media_type: 'image' },
        { id: 5, media_url: '/herovideo.mp4', category: 'Videos', title: 'Academy Tour', media_type: 'video' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(galleryItems.map(item => item.category))]
  const images = galleryItems.filter(item => item.media_type === 'image')
  const videos = galleryItems.filter(item => item.media_type === 'video')

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory)

  const allMedia = [...filteredImages.map(img => ({ ...img, type: 'image', src: img.media_url })), ...videos.map(vid => ({ ...vid, type: 'video', src: vid.media_url, thumbnail: vid.media_url }))]
  const displayMedia = activeTab === 'all' ? allMedia : activeTab === 'images' ? filteredImages.map(img => ({ ...img, type: 'image', src: img.media_url })) : videos.map(vid => ({ ...vid, type: 'video', src: vid.media_url, thumbnail: vid.media_url }))

  return (
    <>
      <Helmet>
        <title>Gallery - Academy</title>
        <meta name="description" content="Explore our photo and video gallery" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#5B1E28' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-3">Visual Showcase</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Visual</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Gallery</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto" />
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {['all', 'images', 'videos'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? 'bg-[#9A7650] text-white' 
                    : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category Filter (for images) */}
          {(activeTab === 'all' || activeTab === 'images') && (
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#9A7650]/20 text-[#9A7650] border border-[#9A7650]' 
                      : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#9A7650] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayMedia.length === 0 ? (
            <div className="text-center py-20 equestrian-card rounded-lg">
              <p className="text-[#B6A58F] text-lg">No gallery items found</p>
              <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayMedia.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => setSelectedMedia(item)}
                  className="relative group cursor-pointer overflow-hidden rounded-sm aspect-square"
                >
                  <img 
                    src={item.type === 'video' ? (item.thumbnail || item.src) : item.src} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {item.type === 'video' && (
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={24} className="text-[#5B1E28] ml-1" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          
          <div onClick={e => e.stopPropagation()} className="max-w-5xl w-full">
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.src} alt={selectedMedia.title} className="w-full h-auto rounded-lg" />
            ) : (
              <video src={selectedMedia.src} controls autoPlay className="w-full h-auto rounded-lg" />
            )}
            <p className="text-white text-center mt-4 text-lg">{selectedMedia.title}</p>
          </div>
        </div>
      )}
    </>
  )
}
