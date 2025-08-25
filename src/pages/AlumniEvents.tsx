import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Plus, Clock, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';

interface AlumniEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  max_attendees: number;
  registration_url: string;
  image_url: string;
  created_at: string;
  created_by: string;
}

export default function AlumniEvents() {
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    event_type: 'networking',
    max_attendees: '',
    registration_url: '',
  });

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchRegisteredEvents();
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alumni_events',
        },
        (payload) => {
          console.log('Event update:', payload);
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setRegisteredEvents(data?.map(item => item.event_id) || []);
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('alumni_events')
        .insert({
          ...newEvent,
          created_by: user.id,
          event_date: new Date(newEvent.event_date).toISOString(),
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
        });

      if (error) throw error;

      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });

      setShowCreateDialog(false);
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        location: '',
        event_type: 'networking',
        max_attendees: '',
        registration_url: '',
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "You've successfully registered for this event.",
      });

      fetchRegisteredEvents();
    } catch (error: any) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for event.",
        variant: "destructive",
      });
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Unregistered",
        description: "You've been unregistered from this event.",
      });

      fetchRegisteredEvents();
    } catch (error: any) {
      console.error('Error unregistering from event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unregister from event.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800';
      case 'career_fair': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'educational': return 'bg-orange-100 text-orange-800';
      case 'reunion': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.event_type === filterType;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.event_date) >= new Date()
  );

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.event_date) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Alumni Events</h1>
              <p className="text-lg text-muted-foreground">
                Connect with fellow alumni at networking events, career fairs, and social gatherings
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Alumni Event</DialogTitle>
                  <DialogDescription>
                    Organize an event for fellow alumni to connect and network
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Alumni Networking Mixer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Describe your event, what attendees can expect..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Date & Time</Label>
                      <Input
                        id="event_date"
                        type="datetime-local"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Venue name or virtual link"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_type">Event Type</Label>
                      <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="career_fair">Career Fair</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="reunion">Reunion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
                      <Input
                        id="max_attendees"
                        type="number"
                        value={newEvent.max_attendees}
                        onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
                        placeholder="50"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_url">Registration URL (Optional)</Label>
                    <Input
                      id="registration_url"
                      type="url"
                      value={newEvent.registration_url}
                      onChange={(e) => setNewEvent({ ...newEvent, registration_url: e.target.value })}
                      placeholder="https://eventbrite.com/..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="career_fair">Career Fair</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="reunion">Reunion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upcoming Events */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => {
                  const isRegistered = registeredEvents.includes(event.id);
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {event.event_type.replace('_', ' ')}
                          </Badge>
                          {isRegistered && (
                            <Badge variant="secondary">Registered</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.event_date).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                          {event.max_attendees && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Max {event.max_attendees} attendees
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="flex gap-2">
                          {event.registration_url ? (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Register
                              </a>
                            </Button>
                          ) : (
                            <>
                              {isRegistered ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => unregisterFromEvent(event.id)}
                                >
                                  Unregister
                                </Button>
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => registerForEvent(event.id)}
                                >
                                  Register
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!loading && upcomingEvents.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground">
                  Check back later or create your own event!
                </p>
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Past Events</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardHeader>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}