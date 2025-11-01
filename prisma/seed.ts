import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.savedPost.deleteMany();
  await prisma.story.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      bio: "Photography enthusiast 📸",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      username: "janesmith",
      email: "jane@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      bio: "Travel lover ✈️ | Food blogger 🍕",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Mike Wilson",
      username: "mikewilson",
      email: "mike@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      bio: "Fitness & Lifestyle 💪",
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      username: "sarahj",
      email: "sarah@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      bio: "Artist 🎨 | Coffee addict ☕",
    },
  });

  console.log("Created users");

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      caption: "Beautiful sunset at the beach 🌅",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      userId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      caption: "Coffee and croissants for breakfast ☕🥐",
      imageUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      userId: user2.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      caption: "Morning workout session 💪 #fitness",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      userId: user3.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      caption: "New artwork in progress 🎨✨",
      imageUrl:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
      userId: user4.id,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      caption: "Exploring the city streets 🏙️",
      imageUrl:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      userId: user1.id,
    },
  });

  console.log("Created posts");

  // Create likes
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: user2.id },
      { postId: post1.id, userId: user3.id },
      { postId: post2.id, userId: user1.id },
      { postId: post2.id, userId: user4.id },
      { postId: post3.id, userId: user2.id },
      { postId: post4.id, userId: user1.id },
      { postId: post4.id, userId: user3.id },
      { postId: post5.id, userId: user2.id },
    ],
  });

  console.log("Created likes");

  // Create comments
  await prisma.comment.createMany({
    data: [
      { postId: post1.id, userId: user2.id, text: "Amazing view! 😍" },
      { postId: post1.id, userId: user3.id, text: "Love this!" },
      { postId: post2.id, userId: user1.id, text: "Looks delicious!" },
      { postId: post3.id, userId: user2.id, text: "Keep it up! 💪" },
      { postId: post4.id, userId: user1.id, text: "Beautiful work! 🎨" },
    ],
  });

  console.log("Created comments");

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user1.id, followingId: user3.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user2.id, followingId: user4.id },
      { followerId: user3.id, followingId: user1.id },
      { followerId: user4.id, followingId: user1.id },
      { followerId: user4.id, followingId: user2.id },
    ],
  });

  console.log("Created follows");

  // Create stories (expire in 24 hours)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.story.createMany({
    data: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800",
        userId: user1.id,
        expiresAt,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        userId: user2.id,
        expiresAt,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800",
        userId: user3.id,
        expiresAt,
      },
    ],
  });

  console.log("Created stories");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
