import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Hash,
  MessageSquare,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useStore } from "../store/useStore";
import type { Post, Topic } from "@/types";

interface SearchResult {
  type: "post" | "topic";
  id: string;
  title: string;
  content?: string;
  slug?: string;
  postCount?: number;
  createdAt?: Date;
  topic?: { name: string; slug: string };
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  className = "",
  placeholder = "Search posts and topics...",
  onClose,
  autoFocus = false,
}: SearchBarProps) {
  const navigate = useNavigate();
  const { topics } = useStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Use the dedicated search endpoint for better results
      const searchResponse = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=15`
      );

      let searchResults: SearchResult[] = [];

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();

        // Convert posts to SearchResult format
        const postResults: SearchResult[] = (searchData.posts || []).map(
          (post: Post) => ({
            type: "post" as const,
            id: post.id,
            title:
              post.content.substring(0, 100) +
              (post.content.length > 100 ? "..." : ""),
            content: post.content,
            createdAt: post.createdAt,
            topic: post.topic,
          })
        );

        // Convert topics to SearchResult format
        const topicResults: SearchResult[] = (searchData.topics || []).map(
          (topic: any) => ({
            type: "topic" as const,
            id: topic.id,
            title: topic.name,
            content: topic.description,
            slug: topic.slug,
            postCount: topic.postCount,
          })
        );

        searchResults = [...topicResults, ...postResults];
      }

      setResults(searchResults.slice(0, 15)); // Limit to 15 results
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          // Navigate to search results page
          navigate(`/search?q=${encodeURIComponent(query)}`);
          handleClose();
        }
        break;
      case "Escape":
        handleClose();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (result.type === "topic") {
      navigate(`/topics/${result.slug}`);
    } else {
      // For posts, navigate to the topic page and potentially scroll to the post
      navigate(`/topics/${result.topic?.slug}#post-${result.id}`);
    }
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
    onClose?.();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="input pl-10 pr-10 w-full"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background-tertiary border border-border-primary rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center space-x-2 text-primary-500">
                <div className="w-4 h-4 border-2 border-primary-300 border-t-accent-500 rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="p-4 text-center text-primary-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  handleClose();
                }}
                className="text-accent-600 hover:text-accent-700 text-sm mt-1"
              >
                View all search results
              </button>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors ${
                    index === selectedIndex ? "bg-primary-100" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.type === "topic" ? (
                        <Hash className="h-4 w-4 text-accent-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-primary-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-primary-900 truncate">
                          {result.type === "topic"
                            ? result.title
                            : `Post in ${result.topic?.name}`}
                        </span>
                        {result.type === "topic" &&
                          result.postCount &&
                          result.postCount > 10 && (
                            <TrendingUp className="h-3 w-3 text-pink-500" />
                          )}
                      </div>

                      {result.content && (
                        <p className="text-sm text-primary-600 line-clamp-2">
                          {result.content}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 mt-1 text-xs text-primary-400">
                        {result.type === "topic" ? (
                          <span>{result.postCount} posts</span>
                        ) : (
                          result.createdAt && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(result.createdAt)}</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {query && (
                <div className="border-t border-border-primary mt-2 pt-2">
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      handleClose();
                    }}
                    className="w-full px-4 py-2 text-left text-accent-600 hover:text-accent-700 hover:bg-primary-50 transition-colors text-sm"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
