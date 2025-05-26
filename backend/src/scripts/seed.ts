import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleTopics = [
  {
    name: "General Discussion",
    slug: "general-discussion",
    description: "Open discussion about anything and everything",
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Discuss the latest in tech, programming, and innovation",
  },
  {
    name: "Philosophy",
    slug: "philosophy",
    description: "Deep thoughts and philosophical discussions",
  },
  {
    name: "Books & Literature",
    slug: "books-literature",
    description: "Share thoughts about books, stories, and writing",
  },
  {
    name: "Music",
    slug: "music",
    description: "All things music - from classical to experimental",
  },
  {
    name: "Art & Design",
    slug: "art-design",
    description: "Creative discussions about art, design, and aesthetics",
  },
  {
    name: "Science",
    slug: "science",
    description: "Scientific discoveries, theories, and discussions",
  },
  {
    name: "Random Thoughts",
    slug: "random-thoughts",
    description: "Shower thoughts, random observations, and musings",
  },
];

const samplePosts = [
  {
    content:
      "Welcome to Thought Dump! This is a place for anonymous, unfiltered discussion. Share your thoughts freely and vote on what resonates with you.",
    authorNickname: "Platform Admin",
    topicSlug: "general-discussion",
  },
  {
    content:
      "The intersection of AI and human creativity is fascinating. Are we witnessing the birth of a new form of collaborative intelligence?",
    authorNickname: "TechPhilosopher",
    topicSlug: "technology",
  },
  {
    content:
      "If a tree falls in a forest and no one is around to hear it, does it make a sound? More importantly, does the question matter if we can't verify the answer?",
    authorNickname: "DeepThinker",
    topicSlug: "philosophy",
  },
  {
    content:
      "Just finished reading 'The Midnight Library' - the concept of infinite possibilities and regret really hits different when you're questioning your life choices.",
    authorNickname: "BookWorm42",
    topicSlug: "books-literature",
  },
  {
    content:
      "Lo-fi hip hop has become the unofficial soundtrack of productivity. There's something about those repetitive beats that just helps you focus.",
    authorNickname: "BeatListener",
    topicSlug: "music",
  },
  {
    content:
      "Minimalism in design isn't just about removing elements - it's about finding the perfect balance between function and form.",
    authorNickname: "DesignMind",
    topicSlug: "art-design",
  },
  {
    content:
      "The James Webb telescope images are changing how we think about the early universe. Every photo is like a time machine to cosmic history.",
    authorNickname: "StarGazer",
    topicSlug: "science",
  },
  {
    content:
      "Why do we park in driveways and drive on parkways? English is weird.",
    authorNickname: "RandomBrain",
    topicSlug: "random-thoughts",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (optional - comment out if you want to keep existing data)
  await prisma.vote.deleteMany();
  await prisma.post.deleteMany();
  await prisma.topic.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create topics
  console.log("📝 Creating topics...");
  const topics = await Promise.all(
    sampleTopics.map((topic) =>
      prisma.topic.create({
        data: topic,
      })
    )
  );
  console.log(`✅ Created ${topics.length} topics`);

  // Create posts
  console.log("💭 Creating sample posts...");
  for (const postData of samplePosts) {
    const topic = topics.find((t) => t.slug === postData.topicSlug);
    if (topic) {
      await prisma.post.create({
        data: {
          content: postData.content,
          authorNickname: postData.authorNickname,
          topicId: topic.id,
        },
      });

      // Update topic post count
      await prisma.topic.update({
        where: { id: topic.id },
        data: { postCount: { increment: 1 } },
      });
    }
  }
  console.log(`✅ Created ${samplePosts.length} sample posts`);

  // Add some sample votes
  console.log("👍 Adding sample votes...");
  const posts = await prisma.post.findMany();

  for (const post of posts) {
    // Add random votes (simulating different anonymous users)
    const upvotes = Math.floor(Math.random() * 10) + 1;
    const downvotes = Math.floor(Math.random() * 3);

    for (let i = 0; i < upvotes; i++) {
      await prisma.vote.create({
        data: {
          postId: post.id,
          userId: `anonymous_user_${i}_${post.id}`,
          type: "UPVOTE",
        },
      });
    }

    for (let i = 0; i < downvotes; i++) {
      await prisma.vote.create({
        data: {
          postId: post.id,
          userId: `anonymous_user_down_${i}_${post.id}`,
          type: "DOWNVOTE",
        },
      });
    }

    // Update post vote counts
    await prisma.post.update({
      where: { id: post.id },
      data: {
        upvotes,
        downvotes,
        score: calculateScore(upvotes, downvotes, post.createdAt),
      },
    });
  }

  console.log("✅ Added sample votes");
  console.log("🎉 Database seeded successfully!");
}

// Helper function to calculate score (same as in posts route)
function calculateScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const totalVotes = upvotes + downvotes;
  if (totalVotes === 0) return 0;

  const ratio = upvotes / totalVotes;
  const hoursSincePost = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  return (ratio * Math.log(totalVotes + 1)) / Math.pow(hoursSincePost + 2, 1.8);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
