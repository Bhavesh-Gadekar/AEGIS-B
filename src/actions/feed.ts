'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFeedPosts() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles:user_id (
        full_name,
        handle
      ),
      post_likes (
        user_id
      ),
      likes:post_likes(count),
      comments:comments(count)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching posts:', error)
        return []
    }

    return posts.map((post: any) => {
        const isLiked = user ? post.post_likes.some((like: any) => like.user_id === user.id) : false;
        return {
            id: post.id,
            userId: post.user_id,
            user: post.profiles?.full_name || 'Anonymous User',
            handle: post.profiles?.handle || '@anonymous',
            time: new Date(post.created_at).toLocaleDateString(),
            content: post.content,
            likes: post.likes?.[0]?.count || 0,
            comments: post.comments?.[0]?.count || 0,
            type: post.type,
            imageUrl: post.image_url,
            isLiked: isLiked
        }
    })
}

export async function getUserPosts(userId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
      *,
      profiles:user_id (
        full_name,
        handle
      ),
      post_likes (
        user_id
        ),
      likes:post_likes(count),
      comments:comments(count)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user posts:', error)
        return []
    }

    return posts.map((post: any) => {
        const isLiked = user ? post.post_likes.some((like: any) => like.user_id === user.id) : false;
        return {
            id: post.id,
            userId: post.user_id,
            user: post.profiles?.full_name || 'Anonymous User',
            handle: post.profiles?.handle || '@anonymous',
            time: new Date(post.created_at).toLocaleDateString(),
            content: post.content,
            likes: post.likes?.[0]?.count || 0,
            comments: post.comments?.[0]?.count || 0,
            type: post.type,
            imageUrl: post.image_url,
            isLiked: isLiked
        }
    })
}

export async function toggleLike(postId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to like a post.' }
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

    let error;

    if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
            .from('post_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId)

        if (!deleteError) {
            // Decrement count manually since RPC might not exist
            // Note: This is not atomic, but sufficient for this prototype
            const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
            if (post) {
                await supabase.from('posts').update({ likes_count: Math.max(0, (post.likes_count || 0) - 1) }).eq('id', postId);
            }
        }
        error = deleteError;
    } else {
        // Like
        const { error: insertError } = await supabase
            .from('post_likes')
            .insert({ user_id: user.id, post_id: postId })

        if (!insertError) {
            // Increment count manually
            const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
            if (post) {
                await supabase.from('posts').update({ likes_count: (post.likes_count || 0) + 1 }).eq('id', postId);
            }
        }
        error = insertError;
    }

    if (error) {
        console.error('Error toggling like:', error)
        return { error: error.message }
    }

    revalidatePath('/feed')
    return { success: true }
}

export async function createPost(content: string, type: string, imageUrl?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to create a post.' }
    }

    // Map UI types to DB types
    const validTypes = ['research', 'achievement', 'education', 'general'];
    let dbType = type;
    if (!validTypes.includes(type)) {
        if (type === 'question') dbType = 'education';
        else dbType = 'general';
    }

    const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        type: dbType,
        image_url: imageUrl || null
    })

    if (error) {
        console.error('Error creating post:', error)
        return { error: error.message }
    }

    revalidatePath('/feed')
    return { success: true }
}

export async function getComments(postId: string) {
    const supabase = await createClient();

    // Fetch comments
    const { data: comments, error } = await supabase
        .from('comments')
        .select(`
            id,
            user_id,
            content,
            created_at,
            user:user_id (
                full_name,
                avatar_url
            )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return comments.map((comment: any) => ({
        id: comment.id,
        user: comment.user?.full_name || 'Anonymous',
        userId: comment.user_id, // Return raw user_id for permission checks
        content: comment.content,
        time: new Date(comment.created_at).toLocaleDateString(),
        avatar: comment.user?.avatar_url
    }));
}

export async function deleteComment(commentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to delete a comment.' };
    }

    // Verify ownership
    const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id, post_id')
        .eq('id', commentId)
        .single();

    if (fetchError || !comment) {
        return { error: 'Comment not found.' };
    }

    if (comment.user_id !== user.id) {
        // Also allow post author to delete comments? user request says "comment can be deleted only if user commented"
        return { error: 'You are not authorized to delete this comment.' };
    }

    // Delete comment
    const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (deleteError) {
        return { error: deleteError.message };
    }

    // Decrement comment count manually
    const { data: post } = await supabase.from('posts').select('comments_count').eq('id', comment.post_id).single();
    if (post) {
        await supabase.from('posts').update({ comments_count: Math.max(0, (post.comments_count || 0) - 1) }).eq('id', comment.post_id);
    }

    revalidatePath('/feed');
    return { success: true };
}

export async function addComment(postId: string, content: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to comment.' };
    }

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content
    });

    if (error) {
        return { error: error.message };
    }

    // Increment comment count manually
    const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
    if (post) {
        await supabase.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', postId);
    }

    revalidatePath('/feed');
    return { success: true };
}

export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to delete a post.' };
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (fetchError || !post) {
        return { error: 'Post not found.' };
    }

    if (post.user_id !== user.id) {
        return { error: 'You are not authorized to delete this post.' };
    }

    // Delete post
    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (deleteError) {
        console.error('Error deleting post:', deleteError);
        return { error: deleteError.message };
    }

    revalidatePath('/feed');
    return { success: true };
}
