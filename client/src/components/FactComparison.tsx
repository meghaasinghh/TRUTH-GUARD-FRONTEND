import { FactCheck } from "@shared/schema";

interface FactComparisonProps {
  factChecks: FactCheck[];
}

export default function FactComparison({ factChecks }: FactComparisonProps) {
  if (factChecks.length === 0) {
    return null;
  }

  // Get background and border colors based on verdict
  const getStylesForVerdict = (verdict: string) => {
    switch (verdict) {
      case "verified":
        return {
          borderClass: "border-success-500",
          bgClass: "bg-success-50",
          textClass: "text-success-500"
        };
      case "misleading":
        return {
          borderClass: "border-warning-500",
          bgClass: "bg-warning-50",
          textClass: "text-warning-500"
        };
      case "false":
        return {
          borderClass: "border-danger-500",
          bgClass: "bg-danger-50",
          textClass: "text-danger-500"
        };
      default:
        return {
          borderClass: "border-warning-500",
          bgClass: "bg-warning-50",
          textClass: "text-warning-500"
        };
    }
  };

  // Show only up to 3 fact checks to prevent overflow
  const displayedFactChecks = factChecks.slice(0, 3);
  const hasMore = factChecks.length > 3;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Fact Comparison</h3>
        {hasMore && (
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View More
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedFactChecks.map((fact, index) => {
          const { borderClass, bgClass, textClass } = getStylesForVerdict(fact.verdict);
          
          return (
            <div 
              key={index} 
              className={`text-sm border-l-4 ${borderClass} ${bgClass} pl-3 py-2 pr-2`}
            >
              <div className="font-medium mb-1">Claim: {fact.claim}</div>
              <div className="text-gray-600 text-xs">
                <span className={`font-medium ${textClass}`}>
                  {fact.verdict === "verified" ? "Verified" : 
                   fact.verdict === "misleading" ? "Misleading" : "False"}
                </span>
                : {fact.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
