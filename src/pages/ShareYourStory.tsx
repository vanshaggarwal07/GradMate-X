import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft, Loader2, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type FormData = {
  title: string;
  content: string;
  tags: string[];
  newTag: string;
  isSubmitting: boolean;
  isPublished: boolean;
};

const ShareYourStory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    tags: [],
    newTag: "",
    isSubmitting: false,
    isPublished: false
  });
  const [activeTab, setActiveTab] = useState("write");
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(formData.newTag.trim()) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, prev.newTag.trim()],
          newTag: ""
        }));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({ ...prev, isSubmitting: true }));

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success
      setFormData(prev => ({ ...prev, isPublished: true }));
      setCurrentStep(3); // Move to success step
      
      toast({
        title: "Story published successfully!",
        description: "Your story is now live and visible to the community.",
      });
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          content: "",
          tags: [],
          newTag: "",
          isSubmitting: false,
          isPublished: true
        });
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "There was an error publishing your story. Please try again.",
        variant: "destructive"
      });
      setFormData(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your story has been saved as a draft.",
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">What's your story about?</h3>
        <p className="text-muted-foreground text-sm">
          Choose a clear and engaging title that captures the essence of your experience.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Story Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="E.g., How I Landed My Dream Job at Google"
          value={formData.title}
          onChange={handleInputChange}
          className="text-base h-12"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.title.length}/100 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Your Story *</Label>
        <Tabs 
          defaultValue="write" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="border rounded-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="p-4">
            <Textarea
              id="content"
              name="content"
              placeholder="Share your journey, challenges you've overcome, and lessons learned..."
              value={formData.content}
              onChange={handleInputChange}
              className="min-h-[200px] text-base"
            />
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="mr-4">{formData.content.length}/5000 characters</span>
              <span>Markdown is supported</span>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="p-4 min-h-[200px] border-t">
            {formData.content ? (
              <div className="prose max-w-none">
                {formData.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph || <br />}</p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Start writing to see a preview of your story...</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="space-y-2">
        <Label>Tags (up to 5)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {formData.tags.length < 5 && (
          <Input
            placeholder="Add a tag and press Enter"
            value={formData.newTag}
            onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
            onKeyDown={addTag}
            className="h-10"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Add relevant tags to help others find your story (e.g., "Career Change", "Interview Prep", "Mentorship")
        </p>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/success-stories')}
        >
          Cancel
        </Button>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button 
            type="button" 
            onClick={() => setCurrentStep(2)}\n            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Add media to your story</h3>
        <p className="text-muted-foreground text-sm">
          Visuals can make your story more engaging (optional)
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-medium">Add Cover Image</p>
          <p className="text-sm text-muted-foreground">Recommended: 1200x630px</p>
        </div>
        
        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <Video className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-medium">Add Video</p>
          <p className="text-sm text-muted-foreground">YouTube or Vimeo link</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Add relevant links (optional)</Label>
        <div className="flex items-center">
          <LinkIcon className="h-4 w-4 text-muted-foreground mr-2" />
          <Input 
            placeholder="https://example.com" 
            className="flex-1"
          />
          <Button type="button" variant="ghost" className="ml-2">
            Add Link
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
        >
          Back
        </Button>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button 
            type="submit"
            disabled={formData.isSubmitting}
          >
            {formData.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : 'Publish Story'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your story is live! 🎉</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Thank you for sharing your experience with the community. Your story is now published and can help others on their journey.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={() => window.location.href = '/success-stories'}>
          View Your Story
        </Button>
        <Button variant="outline" onClick={() => navigate('/success-stories')}>
          Browse More Stories
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => {
            setFormData({
              title: "",
              content: "",
              tags: [],
              newTag: "",
              isSubmitting: false,
              isPublished: false
            });
            setCurrentStep(1);
          }}
        >
          Write Another Story
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2" 
          onClick={() => currentStep === 1 ? navigate('/success-stories') : setCurrentStep(1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {currentStep === 1 ? 'Back to Stories' : 'Back'}
        </Button>
        
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Your Success Story</h1>
              <p className="text-muted-foreground max-w-2xl">
                Inspire others by sharing your journey, challenges, and how you achieved your goals.
              </p>
              
              <div className="w-full max-w-md mt-6">
                <div className="flex items-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div 
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          currentStep === step 
                            ? 'border-primary bg-primary text-primary-foreground' 
                            : currentStep > step 
                              ? 'border-green-500 bg-green-100 text-green-700' 
                              : 'border-muted-foreground/20'
                        }`}
                      >
                        {currentStep > step ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      {step < 3 && (
                        <div className={`h-0.5 flex-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-muted'}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className={currentStep >= 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}>Write</span>
                  <span className={currentStep >= 2 ? 'font-medium text-foreground' : 'text-muted-foreground'}>Enhance</span>
                  <span className={currentStep >= 3 ? 'font-medium text-foreground' : 'text-muted-foreground'}>Publish</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </CardContent>
            
            {currentStep < 3 && (
              <CardFooter className="bg-muted/30 border-t p-4">
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="hidden sm:inline">Need help writing your story?</span>
                  <Button type="button" variant="link" className="h-auto p-0 ml-1">
                    View tips and examples
                  </Button>
                </div>
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ShareYourStory;
