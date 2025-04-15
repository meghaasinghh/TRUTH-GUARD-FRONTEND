import { Info } from "lucide-react";
import { Recommendation } from "@shared/schema";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-medium mb-3">Recommendations</h3>
      
      <ul className="text-sm space-y-2 text-gray-700">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex items-start">
            <Info className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
