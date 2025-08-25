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
import { Search, MapPin, Building, Calendar, Plus, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';

interface JobOpportunity {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  requirements: string;
  application_url: string;
  expires_at: string;
  created_at: string;
  posted_by: string;
}

export default function CareerOpportunities() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    job_type: 'full-time',
    salary_range: '',
    requirements: '',
    application_url: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job opportunities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const postJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post job opportunities.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('job_opportunities')
        .insert({
          ...newJob,
          posted_by: user.id,
          expires_at: newJob.expires_at ? new Date(newJob.expires_at).toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Job Posted!",
        description: "Your job opportunity has been posted successfully.",
      });

      setShowPostDialog(false);
      setNewJob({
        title: '',
        description: '',
        company: '',
        location: '',
        job_type: 'full-time',
        salary_range: '',
        requirements: '',
        application_url: '',
        expires_at: '',
      });
      fetchJobs();
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job opportunity.",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || job.job_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Career Opportunities</h1>
              <p className="text-lg text-muted-foreground">
                Discover jobs and internships posted by fellow alumni
              </p>
            </div>
            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a Job Opportunity</DialogTitle>
                  <DialogDescription>
                    Share a job or internship opportunity with fellow alumni
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={postJob} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="Software Engineer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        placeholder="Company name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="New York, NY or Remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Job Type</Label>
                      <Select value={newJob.job_type} onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={newJob.salary_range}
                        onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                        placeholder="$80,000 - $120,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires_at">Application Deadline</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={newJob.expires_at}
                        onChange={(e) => setNewJob({ ...newJob, expires_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what makes it exciting..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="List the required skills, experience, and qualifications..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="application_url">Application URL</Label>
                    <Input
                      id="application_url"
                      type="url"
                      value={newJob.application_url}
                      onChange={(e) => setNewJob({ ...newJob, application_url: e.target.value })}
                      placeholder="https://company.com/careers/apply"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Post Job Opportunity
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, company, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="flex items-center mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type.replace('-', ' ')}
                      </Badge>
                    </div>
                    {job.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="text-sm font-medium text-green-600">
                        {job.salary_range}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                    
                    {job.requirements && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Requirements:</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.requirements}
                        </p>
                      </div>
                    )}

                    {job.expires_at && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Apply by {new Date(job.expires_at).toLocaleDateString()}
                      </div>
                    )}

                    {job.application_url ? (
                      <Button className="w-full" asChild>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply Now
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Contact Posted For Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or check back later for new postings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}