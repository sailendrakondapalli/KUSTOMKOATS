import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const WHATSAPP_NUMBER = "919043700776"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Supabase error loading events:', error)
        toast.error(`Failed to load events: ${error.message}`)
        throw error
      }

      console.log('Loaded events from database:', data)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = []
      const past = []

      data?.forEach(event => {
        const eventDate = new Date(event.event_date)
        eventDate.setHours(0, 0, 0, 0)

        if (eventDate >= today && event.status === 'upcoming') {
          upcoming.push({
            id: event.id,
            title: event.title,
            date: event.event_date,
            time: event.event_time || 'TBA',
            location: event.location || 'TBA',
            capacity: event.capacity || 0,
            registered: event.registered_count || 0,
            image: event.image_url || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
            description: event.description || '',
            category: event.category || 'Event'
          })
        } else {
          past.push({
            id: event.id,
            title: event.title,
            date: event.event_date,
            location: event.location || 'TBA',
            image: event.image_url || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
            description: event.description || '',
            category: event.category || 'Event'
          })
        }
      })

      console.log('Upcoming events:', upcoming)
      console.log('Past events:', past)

      setUpcomingEvents(upcoming)
      setPastEvents(past)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (event) => {
    const text = `*Event Registration*\n\nEvent: ${event.title}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nI would like to register for this event. Please confirm my participation.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    toast.success('Registration request sent!')
  }

  return (
    <>
      <Helmet>
        <title>Events - Academy</title>
        <meta name="description" content="Explore our upcoming and past events" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#5B1E28' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-3">Discover</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Equestrian</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Events</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#B8955A] max-w-2xl mx-auto">
              Join us for exciting competitions, workshops, and celebrations throughout the year
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-8 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#9A7650] text-white'
                  : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-8 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all ${
                activeTab === 'past'
                  ? 'bg-[#9A7650] text-white'
                  : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#9A7650] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'upcoming' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map(event => (
                <div key={event.id} className="equestrian-card rounded-lg overflow-hidden">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#9A7650] text-white px-3 py-1 rounded-full text-xs font-medium uppercase">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="heading-editorial text-2xl mb-3">{event.title}</h3>
                    <p className="text-[#B8955A] text-sm mb-4 leading-relaxed">{event.description}</p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3 text-[#B6A58F] text-sm">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#B6A58F] text-sm">
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#B6A58F] text-sm">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#B6A58F] text-sm">
                        <Users size={16} />
                        <span>{event.registered}/{event.capacity} Registered</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-[#762B35] rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#9A7650] h-full transition-all"
                          style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Register Button */}
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={event.registered >= event.capacity}
                      className={`w-full py-3 rounded-lg font-medium uppercase tracking-wider transition-colors ${
                        event.registered >= event.capacity
                          ? 'bg-[#762B35] text-[#B6A58F] cursor-not-allowed'
                          : 'bg-[#9A7650] hover:bg-[#8A6640] text-white'
                      }`}
                    >
                      {event.registered >= event.capacity ? 'Fully Booked' : 'Register Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <div key={event.id} className="equestrian-card rounded-lg overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#762B35] text-[#B6A58F] px-3 py-1 rounded-full text-xs font-medium uppercase">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-[#F3EBDD] font-medium text-lg mb-2">{event.title}</h3>
                    <p className="text-[#B8955A] text-sm mb-3 leading-relaxed">{event.description}</p>

                    <div className="flex items-center gap-3 text-[#B6A58F] text-xs">
                      <Calendar size={14} />
                      <span>{new Date(event.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && ((activeTab === 'upcoming' && upcomingEvents.length === 0) || 
            (activeTab === 'past' && pastEvents.length === 0)) && (
            <div className="text-center py-20 equestrian-card rounded-lg">
              <p className="text-[#B6A58F] text-lg">No {activeTab} events at the moment</p>
              <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
