import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User, Mail, Briefcase, GraduationCap, Edit2, Save, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    title: user?.user_metadata?.job_title || 'Software Engineer',
    company: user?.user_metadata?.company || 'Tech Corp',
    graduationYear: user?.user_metadata?.graduation_year || '2020',
    degree: user?.user_metadata?.degree || 'B.Tech in Computer Science',
    bio: 'Passionate about technology and helping others grow in their careers. Open to mentoring and networking opportunities.',
    skills: ['React', 'Node.js', 'TypeScript', 'UI/UX Design'],
  });

  const handleSave = () => {
    // Here you would typically save the profile to your backend
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please sign in to view your profile</h2>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {isEditing ? (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24" />
              <div className="px-6 pb-6 -mt-12 relative">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24 border-4 border-white">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={profile.fullName} />
                    <AvatarFallback>
                      {profile.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center mt-4">
                  <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                  <p className="text-gray-600">{profile.title}</p>
                  <p className="text-sm text-gray-500">{profile.company}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profile.degree} ({profile.graduationYear})</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Bio and Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  <span>About Me</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    {isEditing ? (
                      <Input
                        id="title"
                        name="title"
                        value={profile.title}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{profile.title}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        name="company"
                        value={profile.company}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{profile.company}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Degree</Label>
                    {isEditing ? (
                      <Input
                        name="degree"
                        value={profile.degree}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{profile.degree}</p>
                    )}
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    {isEditing ? (
                      <Input
                        name="graduationYear"
                        value={profile.graduationYear}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1">{profile.graduationYear}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
