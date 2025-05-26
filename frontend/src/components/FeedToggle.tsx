import { TrendingUp, Clock } from "lucide-react";
import { useStore } from "../store/useStore";

export function FeedToggle() {
  const { feedType, setFeedType } = useStore();

  return (
    <div className="glass rounded-xl p-1 backdrop-blur-md">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setFeedType("chronological")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            feedType === "chronological"
              ? "bg-gradient-accent text-white shadow-glow transform scale-105"
              : "text-primary-600 hover:text-primary-700 hover:bg-primary-100/50"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Latest</span>
        </button>

        <button
          onClick={() => setFeedType("trending")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            feedType === "trending"
              ? "bg-gradient-pink text-white shadow-glow transform scale-105"
              : "text-primary-600 hover:text-primary-700 hover:bg-primary-100/50"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Trending</span>
        </button>
      </div>
    </div>
  );
}
