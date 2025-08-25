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
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Video, User, Plus, Users } from 'lucide-react';
import Header from '@/components/Header';

interface OneOnOneSession {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string;
  status: string;
  created_at: string;
  mentor_id: string;
  mentee_id: string;
}

export default function OneOnOne() {
  const [sessions, setSessions] = useState<OneOnOneSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    meeting_link: '',
    mentee_id: '',
  });

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'one_on_one_sessions',
            filter: `mentor_id=eq.${user.id},mentee_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Session update:', payload);
            fetchSessions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('one_on_one_sessions')
        .select('*')
        .or(`mentor_id.eq.${user?.id},mentee_id.eq.${user?.id}`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to schedule sessions.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('one_on_one_sessions')
        .insert({
          ...newSession,
          mentor_id: user.id,
          scheduled_at: new Date(newSession.scheduled_at).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Session Scheduled!",
        description: "Your one-on-one session has been scheduled successfully.",
      });

      setShowScheduleDialog(false);
      setNewSession({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        meeting_link: '',
        mentee_id: '',
      });
      fetchSessions();
    } catch (error: any) {
      console.error('Error scheduling session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule session.",
        variant: "destructive",
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('one_on_one_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session Updated",
        description: `Session has been marked as ${status}.`,
      });

      fetchSessions();
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update session.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.scheduled_at);
    const now = new Date();
    return sessionDate >= now && session.status === 'scheduled';
  });

  const pastSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.scheduled_at);
    const now = new Date();
    return sessionDate < now || session.status !== 'scheduled';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">1-on-1 Sessions</h1>
              <p className="text-lg text-muted-foreground">
                Schedule and manage your mentoring sessions
              </p>
            </div>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule a 1-on-1 Session</DialogTitle>
                  <DialogDescription>
                    Set up a mentoring session with a student or mentee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={scheduleSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      id="title"
                      value={newSession.title}
                      onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                      placeholder="Career guidance session"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSession.description}
                      onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                      placeholder="What will you discuss in this session?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_at">Date & Time</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={newSession.scheduled_at}
                        onChange={(e) => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={newSession.duration_minutes}
                        onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
                        min="15"
                        max="180"
                        step="15"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting_link">Meeting Link (Optional)</Label>
                    <Input
                      id="meeting_link"
                      type="url"
                      value={newSession.meeting_link}
                      onChange={(e) => setNewSession({ ...newSession, meeting_link: e.target.value })}
                      placeholder="https://zoom.us/j/123456789"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Schedule Session
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Upcoming Sessions
              </h2>
              
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(session.scheduled_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {session.description && (
                        <p className="text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {session.duration_minutes} minutes
                        </div>
                        {session.mentor_id === user?.id && (
                          <span className="text-green-600 font-medium">You're mentoring</span>
                        )}
                        {session.mentee_id === user?.id && (
                          <span className="text-blue-600 font-medium">You're attending</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {session.meeting_link && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateSessionStatus(session.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {upcomingSessions.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground">
                      Schedule your first session to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Past Sessions */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <User className="h-6 w-6 mr-2" />
                Past Sessions
              </h2>
              
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(session.scheduled_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {session.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {session.duration_minutes} minutes
                        </div>
                        {session.mentor_id === user?.id && (
                          <span className="text-green-600 font-medium">You mentored</span>
                        )}
                        {session.mentee_id === user?.id && (
                          <span className="text-blue-600 font-medium">You attended</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pastSessions.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No past sessions</h3>
                    <p className="text-muted-foreground">
                      Your completed sessions will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}