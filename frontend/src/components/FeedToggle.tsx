import { TrendingUp, Clock } from "lucide-react";
import { useStore } from "../store/useStore";

export function FeedToggle() {
  const { feedType, setFeedType } = useStore();

  return (
    <div className="flex items-center space-x-1 bg-primary-100 rounded-lg p-1">
      <button
        onClick={() => setFeedType("chronological")}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          feedType === "chronological"
            ? "bg-white text-primary-700 shadow-sm"
            : "text-primary-600 hover:text-primary-700"
        }`}
      >
        <Clock className="h-4 w-4" />
        <span>Latest</span>
      </button>

      <button
        onClick={() => setFeedType("trending")}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          feedType === "trending"
            ? "bg-white text-primary-700 shadow-sm"
            : "text-primary-600 hover:text-primary-700"
        }`}
      >
        <TrendingUp className="h-4 w-4" />
        <span>Trending</span>
      </button>
    </div>
  );
}
