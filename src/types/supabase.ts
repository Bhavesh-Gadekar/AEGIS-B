export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    content: string
                    toxicity_score: number | null
                    toxicity_category: string | null
                    status: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version: string | null
                    is_flagged: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    content: string
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    content?: string
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            conversation_participants: {
                Row: {
                    conversation_id: string
                    user_id: string
                    joined_at: string
                }
                Insert: {
                    conversation_id: string
                    user_id: string
                    joined_at?: string
                }
                Update: {
                    conversation_id?: string
                    user_id?: string
                    joined_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    is_group: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    is_group?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    is_group?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            follows: {
                Row: {
                    follower_id: string
                    following_id: string
                    created_at: string
                }
                Insert: {
                    follower_id: string
                    following_id: string
                    created_at?: string
                }
                Update: {
                    follower_id?: string
                    following_id?: string
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    is_read: boolean | null
                    toxicity_score: number | null
                    toxicity_category: string | null
                    status: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version: string | null
                    is_flagged: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    is_read?: boolean | null
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    content?: string
                    is_read?: boolean | null
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            post_likes: {
                Row: {
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    post_id?: string
                    created_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    image_url: string | null
                    type: 'general' | 'research' | 'achievement' | 'education' // Inferred from previous context
                    likes_count: number | null
                    comments_count: number | null
                    toxicity_score: number | null
                    toxicity_category: string | null
                    status: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version: string | null
                    is_flagged: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    image_url?: string | null
                    type?: 'general' | 'research' | 'achievement' | 'education'
                    likes_count?: number | null
                    comments_count?: number | null
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    image_url?: string | null
                    type?: 'general' | 'research' | 'achievement' | 'education'
                    likes_count?: number | null
                    comments_count?: number | null
                    toxicity_score?: number | null
                    toxicity_category?: string | null
                    status?: 'allowed' | 'warned' | 'blocked' | null
                    rewritten_version?: string | null
                    is_flagged?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    handle: string | null
                    avatar_url: string | null
                    bio: string | null
                    role: 'user' | 'admin' | 'moderator' | null
                    university: string | null
                    field_of_study: string | null
                    reputation_score: number | null
                    toxicity_strikes: number | null
                    is_banned: boolean | null
                    is_online: boolean | null
                    last_seen: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    handle?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    role?: 'user' | 'admin' | 'moderator' | null
                    university?: string | null
                    field_of_study?: string | null
                    reputation_score?: number | null
                    toxicity_strikes?: number | null
                    is_banned?: boolean | null
                    is_online?: boolean | null
                    last_seen?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    handle?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    role?: 'user' | 'admin' | 'moderator' | null
                    university?: string | null
                    field_of_study?: string | null
                    reputation_score?: number | null
                    toxicity_strikes?: number | null
                    is_banned?: boolean | null
                    is_online?: boolean | null
                    last_seen?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            quizzes: {
                Row: {
                    id: number
                    title: string
                    description: string | null
                    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | null
                    time_limit_minutes: number | null
                    is_active: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    description?: string | null
                    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Expert' | null
                    time_limit_minutes?: number | null
                    is_active?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    description?: string | null
                    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Expert' | null
                    time_limit_minutes?: number | null
                    is_active?: boolean | null
                    created_at?: string
                }
            }
            quiz_attempts: {
                Row: {
                    id: string
                    user_id: string
                    quiz_id: number
                    score: number
                    completed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    quiz_id: number
                    score: number
                    completed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    quiz_id?: number
                    score?: number
                    completed_at?: string
                }
            }
            quiz_questions: {
                Row: {
                    id: string
                    quiz_id: number
                    question_text: string
                    options: Json
                    correct_option_index: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    quiz_id: number
                    question_text: string
                    options: Json
                    correct_option_index: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    quiz_id?: number
                    question_text?: string
                    options?: Json
                    correct_option_index?: number
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string | null
                    target_type: string // USER-DEFINED in SQL, treating as string
                    target_id: string
                    reason: string
                    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed' | null
                    admin_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    reporter_id?: string | null
                    target_type: string
                    target_id: string
                    reason: string
                    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed' | null
                    admin_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    reporter_id?: string | null
                    target_type?: string
                    target_id?: string
                    reason?: string
                    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed' | null
                    admin_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            resumes: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    file_url: string | null
                    parsed_content: Json | null
                    ats_score: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string
                    file_url?: string | null
                    parsed_content?: Json | null
                    ats_score?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    file_url?: string | null
                    parsed_content?: Json | null
                    ats_score?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            roadmaps: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    field: string
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    title: string
                    description?: string | null
                    field: string
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    field?: string
                    color?: string | null
                    created_at?: string
                }
            }
            roadmap_steps: {
                Row: {
                    id: string
                    roadmap_id: string
                    title: string
                    description: string | null
                    step_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    roadmap_id: string
                    title: string
                    description?: string | null
                    step_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    roadmap_id?: string
                    title?: string
                    description?: string | null
                    step_order?: number
                    created_at?: string
                }
            }
            user_roadmap_progress: {
                Row: {
                    id: string
                    user_id: string
                    roadmap_id: string
                    status: 'not_started' | 'in_progress' | 'completed' | null
                    current_step_id: string | null
                    started_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    roadmap_id: string
                    status?: 'not_started' | 'in_progress' | 'completed' | null
                    current_step_id?: string | null
                    started_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    roadmap_id?: string
                    status?: 'not_started' | 'in_progress' | 'completed' | null
                    current_step_id?: string | null
                    started_at?: string
                    completed_at?: string | null
                }
            }
        }
    }
}
