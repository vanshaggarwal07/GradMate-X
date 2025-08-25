import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Heart, Award, Users } from 'lucide-react';
import Header from '@/components/Header';

interface Profile {
  user_id: string;
  full_name: string;
  bio: string;
  current_company: string;
  current_position: string;
  location: string;
  major: string;
  graduation_year: number;
  is_mentor: boolean;
  is_available_for_mentorship: boolean;
}

export default function BecomeMentor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    current_company: '',
    current_position: '',
    location: '',
    major: '',
    graduation_year: new Date().getFullYear(),
    is_mentor: false,
    is_available_for_mentorship: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          current_company: data.current_company || '',
          current_position: data.current_position || '',
          location: data.location || '',
          major: data.major || '',
          graduation_year: data.graduation_year || new Date().getFullYear(),
          is_mentor: data.is_mentor || false,
          is_available_for_mentorship: data.is_available_for_mentorship ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: formData.is_mentor ? "Mentor Profile Updated!" : "Profile Updated!",
        description: formData.is_mentor 
          ? "You're now available as a mentor. Students can find and connect with you."
          : "Your profile has been updated successfully.",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Become a Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Share your experience and guide the next generation of professionals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-primary" />
                      Why Mentor?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Give Back</h4>
                        <p className="text-sm text-muted-foreground">
                          Help students and recent graduates navigate their careers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Build Leadership</h4>
                        <p className="text-sm text-muted-foreground">
                          Develop your mentoring and leadership skills
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <UserCheck className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Expand Network</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect with motivated students and fellow alumni
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Profile</CardTitle>
                  <CardDescription>
                    Complete your profile to start mentoring students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_company">Current Company</Label>
                        <Input
                          id="current_company"
                          value={formData.current_company}
                          onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_position">Current Position</Label>
                        <Input
                          id="current_position"
                          value={formData.current_position}
                          onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                          placeholder="Job title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="major">Field of Study</Label>
                        <Input
                          id="major"
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          placeholder="Your major/field of study"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduation_year">Graduation Year</Label>
                        <Input
                          id="graduation_year"
                          type="number"
                          value={formData.graduation_year}
                          onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                          placeholder="2023"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">About You</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell students about your experience, expertise, and what kind of mentorship you can provide..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="is_mentor">Become a Mentor</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable this to appear in the mentor directory
                          </p>
                        </div>
                        <Switch
                          id="is_mentor"
                          checked={formData.is_mentor}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_mentor: checked })}
                        />
                      </div>

                      {formData.is_mentor && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="is_available">Available for New Mentees</Label>
                            <p className="text-sm text-muted-foreground">
                              Turn off if you're currently at capacity
                            </p>
                          </div>
                          <Switch
                            id="is_available"
                            checked={formData.is_available_for_mentorship}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_available_for_mentorship: checked })}
                          />
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}