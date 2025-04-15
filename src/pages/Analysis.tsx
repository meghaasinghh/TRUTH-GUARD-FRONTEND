import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AnalysisResponse } from "@shared/schema";
import ArticleInfo from "@/components/ArticleInfo";
import AnalysisResult from "@/components/AnalysisResult";
import AnalysisBreakdown from "@/components/AnalysisBreakdown";
import FactComparison from "@/components/FactComparison";
import Recommendations from "@/components/Recommendations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";
import { getCurrentTabInfo } from "@/lib/extensionAPI";

export default function Analysis() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/analyze/latest");
        if (!response.ok) {
          throw new Error("Failed to fetch latest analysis");
        }
        const data = await response.json();
        setAnalysisData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analysis results. Please try again.",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestAnalysis();
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading || !analysisData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">Analyzing article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <h1 className="text-lg font-semibold ml-2">FactCheck</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="p-4">
        <ArticleInfo source={analysisData.source} title={analysisData.title} />
        <AnalysisResult 
          classification={analysisData.classification}
          confidence={analysisData.confidence}
          analyzedAt={analysisData.analyzedAt}
        />
        <AnalysisBreakdown criteria={analysisData.criteria} />
        <FactComparison factChecks={analysisData.factChecks} />
        <Recommendations recommendations={analysisData.recommendations} />
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 bg-white border-t border-gray-200 text-center text-xs text-gray-500">
        <p>FactCheck uses machine learning to evaluate content credibility.</p>
        <p className="mt-1">Results should be used as guidance, not definitive judgment.</p>
      </footer>
    </div>
  );
}
