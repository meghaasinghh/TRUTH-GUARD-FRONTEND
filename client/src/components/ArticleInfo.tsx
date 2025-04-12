import { Link } from "lucide-react";

interface ArticleInfoProps {
  source?: string;
  title?: string;
}

export default function ArticleInfo({ source, title }: ArticleInfoProps) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm text-gray-500 flex items-center">
        <Link className="w-4 h-4 mr-1" />
        <span>{source || "Unknown source"}</span>
      </div>
      <h2 className="text-base font-medium line-clamp-2">{title || "Untitled article"}</h2>
    </div>
  );
}
