import { useState } from "react";
import { AlertTriangle, RotateCcw, Check, X, Flag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCurrentTabInfo } from "@/lib/extensionAPI";
import { format } from "date-fns";

interface AnalysisResultProps {
  classification: string;
  confidence: number;
  analyzedAt?: string;
}

export default function AnalysisResult({ 
  classification, 
  confidence, 
  analyzedAt 
}: AnalysisResultProps) {
  const { toast } = useToast();
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Configure UI based on classification
  const getResultConfig = () => {
    switch (classification) {
      case "reliable":
        return {
          icon: Check,
          iconClass: "bg-success-50 text-success-500",
          textClass: "text-success-500",
          barClass: "bg-success-500",
          text: "Reliable Content"
        };
      case "potentially_misleading":
        return {
          icon: AlertTriangle,
          iconClass: "bg-warning-50 text-warning-500",
          textClass: "text-warning-500",
          barClass: "bg-warning-500",
          text: "Potentially Misleading"
        };
      case "likely_false":
        return {
          icon: X,
          iconClass: "bg-danger-50 text-danger-500",
          textClass: "text-danger-500",
          barClass: "bg-danger-500",
          text: "Likely False"
        };
      default:
        return {
          icon: AlertTriangle,
          iconClass: "bg-warning-50 text-warning-500",
          textClass: "text-warning-500",
          barClass: "bg-warning-500",
          text: "Potentially Misleading"
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;

  // Format date
  const formattedDate = analyzedAt 
    ? format(new Date(analyzedAt), "MMM d, h:mm a") 
    : "Just now";

  // Reanalyze mutation
  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      setIsReanalyzing(true);
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
        
        return await response.json();
      } finally {
        setIsReanalyzing(false);
      }
    },
    onSuccess: () => {
      // Force a refresh of the page to get the new analysis
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Reanalysis Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  const handleReanalyze = () => {
    reanalyzeMutation.mutate();
  };

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. Our team will review this analysis.",
      duration: 3000,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Analysis Result</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {formattedDate}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-medium ${config.textClass}`}>{config.text}</span>
              <span className="text-sm font-medium">{confidence}% confidence</span>
            </div>
            <div className="confidence-bar">
              <div 
                className={`confidence-progress ${config.barClass}`} 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        {classification === "reliable" && (
          "This article appears to be from a credible source with factual information. Always verify important information with multiple sources."
        )}
        {classification === "potentially_misleading" && (
          "This article contains elements that suggest potential misinformation or misleading content. Review the analysis details below."
        )}
        {classification === "likely_false" && (
          "This article contains multiple indicators of false information. Exercise caution and verify with trusted sources before sharing."
        )}
      </div>

      <div className="flex gap-2">
        <button 
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md flex items-center"
          onClick={handleReanalyze}
          disabled={isReanalyzing}
        >
          {isReanalyzing ? (
            <>
              <div className="w-4 h-4 mr-1 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reanalyze
            </>
          )}
        </button>
        <button 
          className="text-sm bg-primary-50 hover:bg-primary-100 text-primary-600 py-1.5 px-3 rounded-md flex items-center"
          onClick={handleReport}
        >
          <Flag className="w-4 h-4 mr-1" />
          Report Issue
        </button>
      </div>
    </div>
  );
}
