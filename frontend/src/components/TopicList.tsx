import { Link } from "react-router-dom";
import { Hash, MessageSquare, TrendingUp } from "lucide-react";
import type { Topic } from "@/types";

interface TopicListProps {
  topics: Topic[];
}

export function TopicList({ topics }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <Hash className="h-12 w-12 text-accent-500 mx-auto mb-4" />
        <p className="text-primary-600 font-medium">No topics available yet.</p>
        <p className="text-primary-500 text-sm mt-1">
          Topics will appear here as discussions grow.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {topics.map((topic, index) => (
        <Link
          key={topic.id}
          to={`/topics/${topic.slug}`}
          className="group block slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="card-gradient p-5 h-full hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-accent-500 group-hover:text-pink-500 transition-colors" />
                <h3 className="font-semibold text-primary-900 group-hover:text-accent-600 transition-colors">
                  {topic.name}
                </h3>
              </div>
              {topic.postCount > 10 && (
                <TrendingUp className="h-4 w-4 text-pink-500" />
              )}
            </div>

            {topic.description && (
              <p className="text-sm text-primary-600 mb-3 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-2 text-xs text-primary-500">
                <MessageSquare className="h-3 w-3" />
                <span>
                  {topic.postCount} {topic.postCount === 1 ? "post" : "posts"}
                </span>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
