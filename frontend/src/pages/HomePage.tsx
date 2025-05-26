import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { PostList } from "../components/PostList";
import { TopicList } from "../components/TopicList";
import { FeedToggle } from "../components/FeedToggle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  MessageCircle,
  Heart,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";

export function HomePage() {
  const {
    posts,
    loading,
    error,
    feedType,
    topics,
    topicsLoading,
    setAllPosts,
    setLoading,
    setError,
    setTopics,
    setTopicsLoading,
  } = useStore();

  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Fetch posts - only run once on mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always fetch all posts sorted by newest first
        const response = await fetch(`/api/posts?sortBy=newest&limit=50`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setAllPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [setAllPosts, setLoading, setError]);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);

      try {
        const response = await fetch("/api/topics");

        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }

        const data = await response.json();
        setTopics(data.topics);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [setTopics, setTopicsLoading]);

  // Intersection observer for animations
  useEffect(() => {
    // First, mark all elements as ready for animation
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => {
      el.classList.add("animation-ready");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Anonymous & Safe",
      description:
        "Share your thoughts without revealing your identity. Complete privacy guaranteed.",
      color: "text-green-600",
      bgColor: "bg-green-100/80",
    },
    {
      icon: Zap,
      title: "Real-time Discussions",
      description:
        "Engage in live conversations with instant updates and notifications.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100/80",
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with diverse perspectives from around the world.",
      color: "text-blue-600",
      bgColor: "bg-blue-100/80",
    },
  ];

  const testimonials = [
    {
      text: "Finally, a place where I can share my honest thoughts without judgment.",
      author: "Anonymous User",
      rating: 5,
    },
    {
      text: "The discussions here are so much more authentic than other platforms.",
      author: "Community Member",
      rating: 5,
    },
    {
      text: "Love the minimalist design and focus on meaningful conversations.",
      author: "Regular Contributor",
      rating: 5,
    },
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-primary-600">Loading your thoughts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-5"></div>
        <div className="card-gradient p-8 md:p-16 text-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent"></div>

          {/* Floating decorative elements */}
          <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-accent opacity-20 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-pink opacity-20 rounded-full blur-xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Sparkles className="h-10 w-10 text-gradient animate-pulse" />
                <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                  Thought Dump
                </h1>
                <Sparkles className="h-10 w-10 text-gradient-pink animate-pulse" />
              </div>

              <p className="text-xl md:text-2xl text-primary-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Where raw, unfiltered thoughts find their voice
              </p>

              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                Join a minimalist platform for anonymous discussion. Share
                authentically, discover what resonates, and connect through
                meaningful conversations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link
                to="/create"
                className="btn btn-gradient btn-lg group transform hover:scale-105 transition-all duration-300"
                aria-label="Create a new post"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Share Your Thoughts
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center space-x-6 text-sm text-primary-500">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <TrendingUp className="h-5 w-5 group-hover:text-accent-600 transition-colors" />
                  <span className="group-hover:text-primary-700 transition-colors">
                    Trending Now
                  </span>
                </div>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <Clock className="h-5 w-5 group-hover:text-accent-600 transition-colors" />
                  <span className="group-hover:text-primary-700 transition-colors">
                    Live Updates
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-600">
                  {posts.length}+
                </div>
                <div className="text-sm text-primary-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {topics.length}+
                </div>
                <div className="text-sm text-primary-500">Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-600">24/7</div>
                <div className="text-sm text-primary-500">Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="animate-on-scroll slide-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
            Why Choose Thought Dump?
          </h2>
          <p className="text-lg text-primary-600 max-w-2xl mx-auto">
            Experience authentic conversations in a safe, anonymous environment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeature === index;

            return (
              <div
                key={index}
                className={`card-gradient p-8 text-center transition-all duration-500 cursor-pointer group ${
                  isActive ? "scale-105 shadow-glow" : "hover:scale-102"
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-full ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Topics Section */}
      <section className="animate-on-scroll slide-up">
        <div className="card-gradient p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-10 bg-gradient-accent rounded-full"></div>
              <div>
                <h2 className="text-3xl font-bold text-primary-900">
                  Explore Topics
                </h2>
                <p className="text-primary-600 mt-1">
                  Discover conversations that matter to you
                </p>
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-gradient-pink animate-pulse" />
          </div>

          {topicsLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-4">
                <LoadingSpinner />
                <p className="text-primary-600">Loading topics...</p>
              </div>
            </div>
          ) : (
            <TopicList topics={topics} />
          )}
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="animate-on-scroll slide-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-primary-600">
            Real feedback from real users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-gradient p-6 relative group hover:scale-105 transition-transform duration-300"
            >
              <Quote className="h-8 w-8 text-accent-500 mb-4 opacity-50" />
              <p className="text-primary-700 mb-4 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-500 font-medium">
                  — {testimonial.author}
                </span>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="space-y-8 animate-on-scroll slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-1 h-10 bg-gradient-pink rounded-full"></div>
            <div>
              <h2 className="text-3xl font-bold text-primary-900">
                Latest Discussions
              </h2>
              <p className="text-primary-600 mt-1">
                Join the conversation happening right now
              </p>
            </div>
          </div>
          <FeedToggle />
        </div>

        {error && (
          <div className="card bg-red-50/80 border-red-200 p-6 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <PostList posts={posts} />

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="text-center space-y-4">
              <LoadingSpinner />
              <p className="text-primary-600">Loading more posts...</p>
            </div>
          </div>
        )}
      </section>

      {/* Enhanced Stats Section */}
      <section className="animate-on-scroll slide-up">
        <div className="card-gradient p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Community at a Glance
            </h2>
            <p className="text-primary-600">
              See what makes our community special
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-accent-600 mb-2">
                {posts.length}+
              </div>
              <div className="text-primary-600 text-sm">Active Discussions</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-pink rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {topics.length}+
              </div>
              <div className="text-primary-600 text-sm">Topic Categories</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-orange rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                100%
              </div>
              <div className="text-primary-600 text-sm">Anonymous & Safe</div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-accent-600 mb-2">
                24/7
              </div>
              <div className="text-primary-600 text-sm">Always Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="text-center py-16 animate-on-scroll slide-up">
        <div className="card-gradient p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-5"></div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold text-primary-900">
                Ready to Share Your Voice?
              </h3>
              <p className="text-xl text-primary-600 max-w-2xl mx-auto leading-relaxed">
                Join thousands of others in meaningful, anonymous conversations.
                Your thoughts matter, and your privacy is protected.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/create"
                className="btn btn-gradient btn-lg group transform hover:scale-105 transition-all duration-300"
                aria-label="Start sharing your thoughts"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Start Sharing
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/"
                className="btn btn-secondary btn-lg group"
                aria-label="Browse existing discussions"
              >
                Browse Discussions
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-sm text-primary-500">
              No registration required • Completely anonymous • Start in seconds
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
