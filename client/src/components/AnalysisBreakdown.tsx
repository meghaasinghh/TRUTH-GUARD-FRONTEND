import { AlertTriangle, Check, X } from "lucide-react";
import { Criteria } from "@shared/schema";

interface AnalysisBreakdownProps {
  criteria: Criteria[];
}

export default function AnalysisBreakdown({ criteria }: AnalysisBreakdownProps) {
  const getIconForStatus = (status: string) => {
    switch (status) {
      case "good":
        return {
          Icon: Check,
          className: "bg-success-50 text-success-500"
        };
      case "warning":
        return {
          Icon: AlertTriangle,
          className: "bg-warning-50 text-warning-500"
        };
      case "bad":
        return {
          Icon: X,
          className: "bg-danger-50 text-danger-500"
        };
      default:
        return {
          Icon: AlertTriangle,
          className: "bg-warning-50 text-warning-500"
        };
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "high":
        return rating === "high" && ["good", "bad"].includes(criteria[0]?.status)
          ? (criteria[0]?.status === "good" ? "text-success-500" : "text-danger-500")
          : "text-success-500";
      case "medium":
        return "text-warning-500";
      case "low":
        return rating === "low" && ["good", "bad"].includes(criteria[0]?.status)
          ? (criteria[0]?.status === "good" ? "text-danger-500" : "text-success-500")
          : "text-danger-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="font-medium mb-3">Analysis Breakdown</h3>

      <div>
        {criteria.map((item, index) => {
          const { Icon, className } = getIconForStatus(item.status);
          const ratingColor = getRatingColor(item.rating);
          
          return (
            <div key={index} className="criteria-item">
              <div className="flex-shrink-0 mr-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${className}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              <div className={`text-xs font-medium ${ratingColor} ml-2`}>
                {item.rating.charAt(0).toUpperCase() + item.rating.slice(1)}
              </div>
            </div>
          );
        })}
        
        {criteria.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-2">
            No criteria analysis available.
          </div>
        )}
      </div>
    </div>
  );
}
