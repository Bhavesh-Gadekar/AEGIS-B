
import { getFeedPosts } from '@/actions/feed';
import FeedClientWrapper from './FeedClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function FeedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let currentUser = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
        currentUser = {
            id: user.id,
            ...profile
        };
    }

    const posts = await getFeedPosts();
    return <FeedClientWrapper posts={posts} currentUser={currentUser} />;
}
