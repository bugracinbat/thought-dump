import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Hash,
  MessageSquare,
  Clock,
  TrendingUp,
  ArrowLeft,
  X,
} from "lucide-react";
import { PostList } from "../components/PostList";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SearchBar } from "../components/SearchBar";
import type { Post, Topic } from "@/types";

interface SearchFilters {
  type: "all" | "posts" | "topics";
  sortBy: "relevance" | "newest" | "oldest" | "trending";
  timeRange: "all" | "day" | "week" | "month" | "year";
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    sortBy: "relevance",
    timeRange: "all",
  });

  // Perform search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setPosts([]);
      setTopics([]);
      setTotalResults(0);
    }
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the dedicated search endpoint for better results
      const searchResponse = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${
          filters.type
        }&sortBy=${filters.sortBy}&limit=50`
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        let searchPosts = searchData.posts || [];
        let searchTopics = searchData.topics || [];

        // Apply time range filter to posts
        if (filters.timeRange !== "all") {
          const now = new Date();
          const timeRanges = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000,
          };

          const cutoff = new Date(
            now.getTime() - timeRanges[filters.timeRange]
          );
          searchPosts = searchPosts.filter(
            (post: Post) => new Date(post.createdAt) >= cutoff
          );
        }

        setPosts(searchPosts);
        setTopics(searchTopics);
        setTotalResults(searchPosts.length + searchTopics.length);
      } else {
        throw new Error("Search request failed");
      }
    } catch (err) {
      setError("Failed to perform search");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      sortBy: "relevance",
      timeRange: "all",
    });
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.sortBy !== "relevance" ||
    filters.timeRange !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/" className="btn btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-900">
              Search Results
            </h1>
            {query && (
              <p className="text-primary-600 mt-1">
                {loading
                  ? "Searching..."
                  : `${totalResults} results for "${query}"`}
              </p>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            className="max-w-2xl"
            placeholder="Search posts and topics..."
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:text-primary-700 flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Content Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter("type", e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All</option>
                  <option value="posts">Posts</option>
                  <option value="topics">Topics</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="input text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => updateFilter("timeRange", e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">All time</option>
                  <option value="day">Past day</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner />
            <p className="text-primary-600">Searching...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card bg-red-50/80 border-red-200 p-6 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && query && (
        <div className="space-y-8">
          {/* Topics Results */}
          {topics.length > 0 &&
            (filters.type === "all" || filters.type === "topics") && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Hash className="h-5 w-5 text-accent-500" />
                  <h2 className="text-xl font-bold text-primary-900">
                    Topics ({topics.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <Link
                      key={topic.id}
                      to={`/topics/${topic.slug}`}
                      className="group block"
                    >
                      <div className="card p-4 hover:transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-accent-500 group-hover:text-pink-500 transition-colors" />
                            <h3 className="font-semibold text-primary-900 group-hover:text-accent-600 transition-colors">
                              {topic.name}
                            </h3>
                          </div>
                          {topic.postCount > 10 && (
                            <TrendingUp className="h-4 w-4 text-pink-500" />
                          )}
                        </div>

                        {topic.description && (
                          <p className="text-sm text-primary-600 mb-3 line-clamp-2">
                            {topic.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-primary-500">
                            <MessageSquare className="h-3 w-3" />
                            <span>
                              {topic.postCount}{" "}
                              {topic.postCount === 1 ? "post" : "posts"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* Posts Results */}
          {posts.length > 0 &&
            (filters.type === "all" || filters.type === "posts") && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary-500" />
                  <h2 className="text-xl font-bold text-primary-900">
                    Posts ({posts.length})
                  </h2>
                </div>

                <PostList posts={posts} />
              </div>
            )}

          {/* No Results */}
          {totalResults === 0 && !loading && (
            <div className="text-center py-12">
              <div className="card-gradient p-12 max-w-md mx-auto">
                <Search className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  No results found
                </h3>
                <p className="text-primary-600 mb-6">
                  We couldn't find anything matching "{query}". Try adjusting
                  your search terms or filters.
                </p>
                <div className="space-y-3 text-sm text-primary-500">
                  <p>Suggestions:</p>
                  <ul className="space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Try different keywords</li>
                    <li>• Use fewer words</li>
                    <li>• Clear your filters</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && (
        <div className="text-center py-12">
          <div className="card-gradient p-12 max-w-md mx-auto">
            <Search className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-900 mb-2">
              Search Thought Dump
            </h3>
            <p className="text-primary-600">
              Find posts, topics, and discussions that interest you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
