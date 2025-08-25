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
import { Search, Building, User, Plus, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';

interface ReferralRequest {
  id: string;
  company: string;
  position: string;
  message: string;
  status: string;
  created_at: string;
  requester_id: string;
  referee_id: string;
}

export default function GetReferrals() {
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ReferralRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    company: '',
    position: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      fetchReferralRequests();
      fetchMyRequests();
    }
  }, [user]);

  const fetchReferralRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferralRequests(data || []);
    } catch (error) {
      console.error('Error fetching referral requests:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_requests')
        .select('*')
        .eq('requester_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReferralRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request referrals.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_requests')
        .insert({
          ...newRequest,
          requester_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Referral Request Posted!",
        description: "Your request has been posted. Alumni can now offer to help you.",
      });

      setShowRequestDialog(false);
      setNewRequest({
        company: '',
        position: '',
        message: '',
      });
      fetchReferralRequests();
      fetchMyRequests();
    } catch (error: any) {
      console.error('Error creating referral request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create referral request.",
        variant: "destructive",
      });
    }
  };

  const offerReferral = async (requestId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to offer referrals.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_requests')
        .update({
          referee_id: user.id,
          status: 'accepted',
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Referral Accepted!",
        description: "You've accepted to help with this referral request.",
      });

      fetchReferralRequests();
    } catch (error: any) {
      console.error('Error offering referral:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to offer referral.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'declined': return XCircle;
      default: return MessageSquare;
    }
  };

  const filteredRequests = referralRequests.filter(request =>
    request.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Get Referrals</h1>
              <p className="text-lg text-muted-foreground">
                Request referrals from alumni or help others get referred
              </p>
            </div>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Referral
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Request a Referral</DialogTitle>
                  <DialogDescription>
                    Ask alumni to refer you for a position at their company
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createReferralRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newRequest.company}
                      onChange={(e) => setNewRequest({ ...newRequest, company: e.target.value })}
                      placeholder="Google, Apple, Microsoft..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={newRequest.position}
                      onChange={(e) => setNewRequest({ ...newRequest, position: e.target.value })}
                      placeholder="Software Engineer, Product Manager..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newRequest.message}
                      onChange={(e) => setNewRequest({ ...newRequest, message: e.target.value })}
                      placeholder="Tell alumni about your background and why you're interested in this role..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Post Referral Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Open Referral Requests */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Open Requests</h2>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by company or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.position}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Building className="h-4 w-4 mr-1" />
                            {request.company}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {request.message}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        Posted {new Date(request.created_at).toLocaleDateString()}
                      </div>

                      {request.status === 'open' && request.requester_id !== user?.id && (
                        <Button 
                          className="w-full"
                          onClick={() => offerReferral(request.id)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Offer Referral
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredRequests.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No open requests</h3>
                    <p className="text-muted-foreground">
                      Check back later for new referral requests.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* My Requests */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
              
              <div className="space-y-4">
                {myRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{request.position}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              {request.company}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.message}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Posted {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {myRequests.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                    <p className="text-muted-foreground">
                      Click "Request Referral" to post your first request.
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