import React, { useState, useEffect } from "react";

const blogs = [
  {
    id: 1,
    title: "This is bento grid in vercel blog",
    author: "Michael Jordan",
    date: "12.10.1999",
    image: "https://picsum.photos/seed/1/600/400",
    avatar: "https://i.pravatar.cc/150?img=1",
    link: "/",
  },
  {
    id: 2,
    title: "Exploring the Future of Web Development",
    author: "Jane Doe",
    date: "05.07.2023",
    image: "https://picsum.photos/seed/2/600/400",
    avatar: "https://i.pravatar.cc/150?img=2",
    link: "/",
  },
  {
    id: 3,
    title: "How to Build Scalable Applications",
    author: "John Smith",
    date: "18.03.2021",
    image: "https://picsum.photos/seed/3/600/400",
    avatar: "https://i.pravatar.cc/150?img=3",
    link: "/",
  },
  {
    id: 4,
    title: "Mastering React with Next.js",
    author: "Alice Johnson",
    date: "24.12.2022",
    image: "https://picsum.photos/seed/4/600/400",
    avatar: "https://i.pravatar.cc/150?img=4",
    link: "/",
  },
];

export default function SolidBento() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="grid max-h-screen h-auto p-4 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-4 gap-4">
      {blogs.map((blog, index) => (
        <a
          key={blog.id}
          href={blog.link}
          className={`group relative flex overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
            index === 0
              ? "md:col-span-1 md:row-span-3"
              : index === 3
              ? "md:col-span-1 md:row-span-3"
              : "md:col-span-1 md:row-span-1 lg:row-span-2"
          }`}
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="absolute w-full h-full transition-all duration-300 group-hover:scale-110 group-hover:opacity-50 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="relative flex h-full w-full flex-col justify-end p-6 text-white">
            <h2 className="mb-2 text-2xl font-bold leading-tight">{blog.title}</h2>
            <div className="flex items-center space-x-2">
              <img
                src={blog.avatar}
                alt={blog.author}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-medium">{blog.author}</span>
              <span className="text-xs text-gray-300">{blog.date}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
