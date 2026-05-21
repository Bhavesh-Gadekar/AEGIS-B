'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for convenience
    // In a real app, you might want to validate the formData
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', await supabase.auth.getUser().then(({ data }) => data.user?.id))
        .single();

    revalidatePath('/', 'layout')

    if (profile?.role === 'admin') {
        return redirect('/admin/dashboard')
    }

    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for convenience
    // In a real app, you might want to validate the formData
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const university = formData.get('university') as string
    const field = formData.get('field') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                full_name: fullName,
                university: university,
                field_of_study: field,
            },
        },
    })

    if (error) {
        console.error('Login error:', error)
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}
