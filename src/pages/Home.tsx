import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoaderPinwheel } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResponse } from "@shared/schema";
import { getCurrentTabInfo } from "@/lib/extensionAPI";

export default function Home() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const analyzeArticleMutation = useMutation({
    mutationFn: async (url: string) => {
      setIsLoading(true);
      try {
        // Get article content from the current tab
        const tabInfo = await getCurrentTabInfo();
        if (!tabInfo.content) {
          throw new Error("Could not extract article content from the page.");
        }

        // Send to API for analysis
        const response = await apiRequest("POST", "/api/analyze", {
          url: tabInfo.url,
          title: tabInfo.title,
          content: tabInfo.content,
          source: new URL(tabInfo.url).hostname
        });
        
        const result: AnalysisResponse = await response.json();
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      // Navigate to analysis page with the result ID
      navigate("/analysis");
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  const handleAnalyzeCurrentPage = async () => {
    try {
      setIsLoading(true);
      const tabInfo = await getCurrentTabInfo();
      if (tabInfo.url) {
        setUrl(tabInfo.url);
        analyzeArticleMutation.mutate(tabInfo.url);
      } else {
        toast({
          title: "Error",
          description: "Could not detect the current page URL.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access the current page. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      analyzeArticleMutation.mutate(url);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="flex items-center mb-6">
        <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <h1 className="text-2xl font-semibold ml-2">FactCheck</h1>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Fake News Detection</CardTitle>
          <CardDescription>
            Analyze news articles for credibility and detect potential fake news
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mb-4" 
            onClick={handleAnalyzeCurrentPage} 
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            )}
            Analyze Current Page
          </Button>
          
          <div className="text-sm text-center text-gray-500 mb-4">or</div>
          
          <form onSubmit={handleAnalyzeUrl}>
            <div className="flex items-center space-x-2">
              <Input
                type="url"
                placeholder="Enter article URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading || !url}>
                {isLoading ? (
                  <LoaderPinwheel className="h-4 w-4 animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-6 text-center">
        FactCheck uses machine learning to evaluate content credibility.<br />
        Results should be used as guidance, not definitive judgment.
      </p>
    </div>
  );
}
