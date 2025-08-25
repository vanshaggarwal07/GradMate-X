import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, MessageSquare, ThumbsUp, Share2, Bookmark, Star, GraduationCap, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const SuccessStories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("recent");
  const [stories, setStories] = useState([
    {
      id: 1,
      title: "From Student to Senior Developer in 3 Years",
      excerpt: "How the GradMate community helped me land my dream job at Google...",
      author: "Priya Sharma",
      role: "Senior Software Engineer at Google",
      date: "2 days ago",
      readTime: "5 min read",
      likes: 128,
      comments: 24,
      tags: ["Career Growth", "Interview Prep", "Mentorship"],
      isBookmarked: false,
      isLiked: false,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "How I Switched Careers to Tech with No Experience",
      excerpt: "My journey from marketing professional to full-stack developer in 6 months...",
      author: "Rahul Verma",
      role: "Full Stack Developer at Microsoft",
      date: "1 week ago",
      readTime: "7 min read",
      likes: 245,
      comments: 42,
      tags: ["Career Change", "Learning Path", "Success Story"],
      isBookmarked: true,
      isLiked: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      title: "Breaking Into Product Management - A Non-Tech Background",
      excerpt: "How I leveraged my business degree to break into product management...",
      author: "Neha Patel",
      role: "Product Manager at Amazon",
      date: "2 weeks ago",
      readTime: "6 min read",
      likes: 189,
      comments: 31,
      tags: ["Product Management", "Non-Tech", "Career Transition"],
      isBookmarked: false,
      isLiked: false,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 4,
      title: "From Bootcamp to $150k Job in 4 Months",
      excerpt: "My complete roadmap to landing a high-paying developer job in record time...",
      author: "Amit Singh",
      role: "Frontend Developer at Netflix",
      date: "3 weeks ago",
      readTime: "8 min read",
      likes: 312,
      comments: 67,
      tags: ["Coding Bootcamp", "Job Search", "Salary Negotiation"],
      isBookmarked: true,
      isLiked: false,
      image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  const toggleLike = (id: number) => {
    setStories(stories.map(story => 
      story.id === id ? { ...story, isLiked: !story.isLiked, likes: story.isLiked ? story.likes - 1 : story.likes + 1 } : story
    ));
  };

  const toggleBookmark = (id: number) => {
    setStories(stories.map(story => 
      story.id === id ? { ...story, isBookmarked: !story.isBookmarked } : story
    ));
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "popular") return matchesSearch && story.likes > 100;
    if (activeTab === "recent") return matchesSearch;
    return matchesSearch;
  });

  // Sort stories based on active filter
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (activeFilter === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (activeFilter === "popular") return b.likes - a.likes;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real experiences from our community members who've achieved their career goals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search stories, authors, or topics..."
                className="pl-10 pr-4 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-auto"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All Stories</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button 
                variant={activeFilter === "recent" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveFilter("recent")}
                className="h-8"
              >
                Most Recent
              </Button>
              <Button 
                variant={activeFilter === "popular" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveFilter("popular")}
                className="h-8"
              >
                Most Popular
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStories.map((story) => (
            <Card key={story.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 rounded-full h-8 w-8"
                  onClick={() => toggleBookmark(story.id)}
                >
                  <Bookmark 
                    className={`h-4 w-4 ${story.isBookmarked ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl leading-snug">
                  <Link to={`/success-stories/${story.id}`} className="hover:text-blue-600 transition-colors">
                    {story.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-muted-foreground line-clamp-2 mb-4">{story.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{story.readTime}</span>
                  <span>•</span>
                  <span>{story.date}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={story.image} />
                      <AvatarFallback>{story.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{story.author}</p>
                      <p className="text-xs text-muted-foreground">{story.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                      onClick={() => toggleLike(story.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${story.isLiked ? 'fill-current text-rose-500' : ''}`} />
                      <span>{story.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{story.comments}</span>
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedStories.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No stories found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filter to find what you're looking for.</p>
            <Button onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setActiveFilter('recent');
            }}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have a success story to share?</h2>
            <p className="text-muted-foreground mb-6">
              Your experience could inspire and help others in their journey. Share your story with our community!
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/share-your-story">Share Your Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
