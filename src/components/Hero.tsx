import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Trophy, Handshake } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-glow/15 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary-foreground text-sm font-medium mb-8 animate-fade-in">
            <Users className="w-4 h-4 mr-2" />
            Join 50,000+ Alumni Worldwide
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Connect. Learn.{" "}
            <span className="bg-gradient-to-r from-primary-glow to-primary-foreground bg-clip-text text-transparent animate-glow">
              Grow.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
            The ultimate alumni networking platform where graduates, students, and faculty 
            connect to build lasting relationships, share opportunities, and create success together.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button asChild variant="hero" size="lg" className="group">
              <a href="/career-opportunities">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" target="_blank" rel="noopener noreferrer">
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-foreground/10 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">50K+</div>
              <div className="text-primary-foreground/60">Active Alumni</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-foreground/10 rounded-lg mx-auto mb-3">
                <Handshake className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">10K+</div>
              <div className="text-primary-foreground/60">Mentorships</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-foreground/10 rounded-lg mx-auto mb-3">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-primary-foreground">95%</div>
              <div className="text-primary-foreground/60">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;