import React, { useState, useEffect } from 'react';
import { PublicPost } from '../../types';
import { FileText, Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react';

export const PublicPostsSection: React.FC = () => {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [activePost, setActivePost] = useState<PublicPost | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 md:py-20 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Articles & Technical Guides</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            WorkHub Public Posts
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Practical guides on PDF conversions, data entry practices, and workflow optimization.
          </p>
        </div>

        {activePost ? (
          /* Single Post Detail Reader */
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setActivePost(null)}
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              ← Back to All Posts
            </button>

            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span className="bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded font-semibold">
                  {activePost.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {activePost.date}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{activePost.title}</h1>
            </div>

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-6">
              {activePost.content}
            </div>
          </div>
        ) : (
          /* Posts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="cursor-pointer group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="bg-slate-800 text-cyan-400 px-2.5 py-0.5 rounded font-semibold">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="pt-2 text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
