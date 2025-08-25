import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MapPin, Briefcase, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Profile {
  user_id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  current_company: string;
  current_position: string;
  location: string;
  major: string;
  graduation_year: number;
}

export default function FindMentor() {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true)
        .eq('is_available_for_mentorship', true);

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: "Error",
        description: "Failed to load mentors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestMentorship = async (mentorId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request mentorship.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('mentorships')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          message: 'I would like to request mentorship from you.',
        });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Your mentorship request has been sent successfully.",
      });
    } catch (error: any) {
      console.error('Error requesting mentorship:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send mentorship request.",
        variant: "destructive",
      });
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Find Your Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Connect with experienced alumni who can guide your career journey
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, company, or field of study..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.user_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={mentor.avatar_url} alt={mentor.full_name} />
                      <AvatarFallback>
                        {mentor.full_name?.split(' ').map(n => n[0]).join('') || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{mentor.full_name}</CardTitle>
                    <CardDescription className="text-sm">
                      {mentor.current_position} at {mentor.current_company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {mentor.bio || "Experienced professional ready to guide the next generation."}
                    </p>
                    
                    <div className="space-y-2">
                      {mentor.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {mentor.location}
                        </div>
                      )}
                      {mentor.major && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {mentor.major} • Class of {mentor.graduation_year}
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => requestMentorship(mentor.user_id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or check back later for new mentors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}