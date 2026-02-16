"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Heart, MessageSquare, Share2, MoreHorizontal, CheckCircle2, ImageIcon, Trash2 } from 'lucide-react';
import { toggleLike, getComments, addComment } from '@/actions/feed';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface Post {
  id: string | number;
  user: string;
  handle: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  type: string;
  imageUrl?: string;
  isLiked?: boolean;
  userId?: string;
}

interface FeedTabProps {
  isDark: boolean;
  posts: Post[];
  currentUser: any;
}

const FeedItem: React.FC<{ post: Post; isDark: boolean; currentUser: any }> = ({ post, isDark, currentUser }) => {
  const router = useRouter(); // Must be inside the component

  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Sync state with props when parent re-renders (e.g. after server revalidation)
  React.useEffect(() => {
    setLikes(post.likes);
    setIsLiked(post.isLiked);
    setCommentsCount(post.comments);
  }, [post.likes, post.isLiked, post.comments]);

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setIsCommentsLoading(true);
      try {
        const fetchedComments = await getComments(String(post.id));
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to load comments", error);
        toast.error("Failed to load comments");
      } finally {
        setIsCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const result = await addComment(String(post.id), newComment);
      if (result.error) {
        toast.error(result.error);
      } else {
        setNewComment('');
        setCommentsCount(commentsCount + 1);
        // Optimistically add comment or re-fetch. Let's re-fetch for simplicity or just mock push
        const fetchedComments = await getComments(String(post.id));
        setComments(fetchedComments);
        toast.success("Comment added");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to add comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleLike = async () => {
    if (isLikeLoading) return;

    // Optimistic update
    const previousLikes = likes;
    const previousIsLiked = isLiked;

    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike(String(post.id));
      if (result?.error) {
        // Revert on error
        setLikes(previousLikes);
        setIsLiked(previousIsLiked);
        console.error(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <div className={`p-6 border rounded-[2.5rem] transition-all duration-500 group ${isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-black/5 bg-white shadow-sm hover:bg-gray-50'}`}>
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg relative ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          {post.user[0]}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-inherit flex items-center justify-center">
            <CheckCircle2 className="w-2 h-2 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{post.user}</span>
              <span className="text-gray-500 text-xs">{post.handle} • {post.time}</span>
            </div>
            {currentUser && currentUser.id === post.userId && (
              <div className="relative group/menu">
                <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
                <div className="absolute right-0 top-full pt-2 w-32 hidden group-hover/menu:block z-20">
                  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <button
                      onClick={() => router.push(`/edit-post/${post.id}`)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5">
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this post?')) {
                          const { deletePost } = await import('@/actions/feed');
                          const result = await deletePost(String(post.id));
                          if (result.error) toast.error(result.error);
                          else toast.success('Post deleted');
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!currentUser || currentUser.id !== post.userId ? <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" /> : null}
          </div>
          <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {post.content}
          </p>

          {post.imageUrl && (
            <div className={`w-full aspect-video rounded-3xl mb-4 overflow-hidden border border-white/10 bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.01] ${isDark ? 'from-zinc-900 via-indigo-900/10 to-zinc-900' : 'from-zinc-100 via-indigo-50 to-zinc-100'
              } flex flex-col items-center justify-center gap-3 relative`}>
              {/* If actual image URL exists, show it */}
              <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover absolute inset-0 z-0" />

              {/* Overlay for aesthetic consistency if needed, or remove if raw image is preferred */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
            </div>
          )}

          <div className="flex flex-col text-gray-500">
            <div className="flex items-center gap-8 mb-2">
              <button
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> <span className="text-xs font-bold">{likes}</span>
              </button>
              <button
                onClick={toggleComments}
                className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">{commentsCount}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'} animate-in slide-in-from-top-2 fade-in duration-300`}>
                {isCommentsLoading ? (
                  <div className="text-center py-4 text-xs text-gray-500">Loading comments...</div>
                ) : (
                  <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group/comment relative">
                          <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                            {comment.avatar ? <img src={comment.avatar} alt={comment.user} className="w-full h-full rounded-xl object-cover" /> : comment.user[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{comment.user}</span>
                              <span className="text-[10px] text-gray-500">{comment.time}</span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comment.content}</p>
                          </div>
                          {/* Delete Comment Button - Only visible on hover and if authorized */}
                          {currentUser && currentUser.id === comment.userId && (
                            <button
                              onClick={async () => {
                                if (confirm("Delete this comment?")) {
                                  const { deleteComment } = await import('@/actions/feed');
                                  const res = await deleteComment(comment.id);
                                  if (res.error) toast.error(res.error);
                                  else {
                                    toast.success("Comment deleted");
                                    setComments(comments.filter(c => c.id !== comment.id));
                                    setCommentsCount(prev => prev - 1);
                                  }
                                }
                              }}
                              className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 text-red-500 hover:bg-red-500/10 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-gray-500">No comments yet. Be the first to start the conversation!</div>
                    )}
                  </div>
                )}

                <form onSubmit={handleAddComment} className="flex gap-2 relative items-center">
                  {/* Current User Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="You" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      currentUser?.full_name?.[0] || '?'
                    )}
                  </div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={`flex-1 outline-none bg-transparent border-none focus:ring-0 text-sm py-2 px-0 ${isDark ? 'text-white placeholder:text-gray-600' : 'text-black placeholder:text-gray-400'}`}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isPostingComment}
                    className={`p-2 rounded-xl transition-all ${newComment.trim() ? (isDark ? 'text-indigo-400 hover:bg-white/10' : 'text-indigo-600 hover:bg-gray-100') : 'text-gray-500 cursor-not-allowed'}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedTab: React.FC<FeedTabProps> = ({ isDark, posts, currentUser }) => {
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto pt-32 pb-24 px-4">
      <div className="flex justify-between items-center mb-12 px-4">
        <h2 className="text-4xl font-black tracking-tight transition-colors">Activity Feed</h2>
        <button
          onClick={() => router.push('/create-post')}
          className={`p-4 rounded-[1.5rem] shadow-2xl transition-all active:scale-95 ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-black hover:bg-gray-800 shadow-black/20'} text-white`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <FeedItem key={post.id} post={post} isDark={isDark} currentUser={currentUser} />
        ))}
      </div>
    </div>
  );
};

export default FeedTab;
