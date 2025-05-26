import { Link } from "react-router-dom";
import type { Topic } from "@/types";

interface TopicListProps {
  topics: Topic[];
}

export function TopicList({ topics }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <p className="text-primary-500 text-center py-4">
        No topics available yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          to={`/topics/${topic.slug}`}
          className="block p-4 border border-primary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <h3 className="font-medium text-primary-900 mb-1">{topic.name}</h3>
          {topic.description && (
            <p className="text-sm text-primary-600 mb-2">{topic.description}</p>
          )}
          <p className="text-xs text-primary-500">
            {topic.postCount} {topic.postCount === 1 ? "post" : "posts"}
          </p>
        </Link>
      ))}
    </div>
  );
}
