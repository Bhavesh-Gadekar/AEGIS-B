const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFollows() {
    console.log('---CHECK FOLLOWS START---');

    // Check Follows Keys
    const { data: followsCols, error: followsError } = await supabase.from('follows').select('*').limit(1);

    if (followsError) {
        console.log('FOLLOWS Table Error:', followsError.message);
    } else if (followsCols.length > 0) {
        console.log('FOLLOWS Keys:', Object.keys(followsCols[0]).join(', '));
    } else {
        // If table is empty, we can't get keys easily via select *. 
        // We'll try to insert a dummy row to see errors or succeed, then delete it, 
        // OR just assume follower_id and following_id based on common patterns if we can't see keys.
        // But usually there's a way. Postgrest doesn't expose generic schema info easily without admin.
        console.log('Follows table exists but is empty. Can\'t infer keys directly.');
    }

    console.log('---CHECK FOLLOWS END---');
}

checkFollows();
