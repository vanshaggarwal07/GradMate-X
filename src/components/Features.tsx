import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Award, 
  Heart,
  ArrowRight,
  UserCheck,
  Building2,
  GraduationCap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Find Your Mentor",
      description: "Connect with experienced alumni who can guide your career journey with personalized advice and insights.",
      cta: "Browse Mentors",
      gradient: "from-blue-500/20 to-purple-500/20",
      path: "/find-mentor"
    },
    {
      icon: UserCheck,
      title: "Become a Mentor", 
      description: "Share your expertise and give back to the community by mentoring the next generation of graduates.",
      cta: "Join as Mentor",
      gradient: "from-purple-500/20 to-pink-500/20",
      path: "/become-mentor"
    },
    {
      icon: Briefcase,
      title: "Career Opportunities",
      description: "Discover exclusive job openings, internships, and career opportunities shared by our alumni network.",
      cta: "View Jobs",
      gradient: "from-green-500/20 to-blue-500/20",
      path: "/career-opportunities"
    },
    {
      icon: Building2,
      title: "Get Referrals",
      description: "Request referrals from alumni working at your dream companies to boost your application success.",
      cta: "Request Referral",
      gradient: "from-orange-500/20 to-red-500/20",
      path: "/get-referrals"
    },
    {
      icon: MessageSquare,
      title: "1-on-1 Sessions",
      description: "Book personalized mentorship calls and virtual meetings with industry experts in your field.",
      cta: "Book Session",
      gradient: "from-cyan-500/20 to-blue-500/20",
      path: "/one-on-one"
    },
    {
      icon: Calendar,
      title: "Alumni Events",
      description: "Join exclusive networking events, career fairs, homecoming gatherings, and professional meetups.",
      cta: "See Events",
      gradient: "from-indigo-500/20 to-purple-500/20",
      path: "/alumni-events"
    }
  ];

  return (
    <section id="mentorship" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Succeed Together
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform brings alumni, students, and faculty together 
            through powerful networking and mentorship tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link to={feature.path} key={index} className="block h-full">
                <Card 
                  className="group relative overflow-hidden border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 h-full"
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg mb-4 group-hover:animate-glow">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary-glow transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                
                  <CardContent className="relative z-10">
                    <CardDescription className="text-foreground/80 mb-6">
                      {feature.description}
                    </CardDescription>
                    <Button variant="outline" className="group-hover:bg-primary-foreground/5 group-hover:border-primary-foreground/20 group-hover:text-foreground transition-colors">
                      {feature.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Success Stories Teaser */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-card">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-6 animate-glow">
              <Award className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Join Our Success Stories</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              From startup founders to Fortune 500 executives, our alumni network has achieved 
              incredible success. Be part of the next chapter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                View Success Stories
              </Button>
              <Button variant="outline" size="lg">
                Share Your Story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;