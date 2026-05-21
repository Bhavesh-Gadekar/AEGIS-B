"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, ChevronRight, ToggleLeft, ToggleRight, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Antigravity = dynamic(() => import('../../../components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

const SettingItem = ({ title, description, type, value, onChange, options, isDark }: any) => (
    <div className={`p-6 rounded-2xl border mb-4 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5 shadow-sm'
        }`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
            </div>

            {type === 'toggle' && (
                <button
                    onClick={() => onChange(!value)}
                    className={`transition-colors ${value ? 'text-indigo-500' : 'text-gray-500'}`}
                >
                    {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
            )}

            {type === 'select' && (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`bg-transparent text-xs font-bold uppercase tracking-wide border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 ${isDark ? 'border-white/20 text-white' : 'border-black/10 text-black'
                        }`}
                >
                    {options?.map((opt: string) => (
                        <option key={opt} value={opt} className={isDark ? 'bg-black' : 'bg-white'}>{opt}</option>
                    ))}
                </select>
            )}

            {type === 'action' && (
                <button
                    onClick={onChange}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                        }`}
                >
                    Manage
                </button>
            )}
        </div>
    </div>
);

export default function CategorySettingsPage() {
    const router = useRouter();
    const params = useParams();
    const category = params.category as string;
    const [isDark, setIsDark] = useState(true);
    const [loading, setLoading] = useState(true);

    // Mock Settings State
    const [settings, setSettings] = useState<any>({
        account: {
            fullName: 'Jaimil Patel',
            username: '@jaimil_p',
            email: 'jaimil@aegis.io',
            language: 'English (US)',
        },
        privacy: {
            privateProfile: false,
            showActivityStatus: true,
            allowTagging: true,
            searchVisibility: 'Global',
        },
        notifications: {
            pushAlerts: true,
            emailDigest: false,
            communityMentions: true,
            systemUpdates: true,
        },
        security: {
            twoFactorAuth: true,
            biometricLogin: false,
            activeSessions: 2,
        },
        display: {
            darkMode: true,
            compactMode: false,
            textSize: 'Medium',
        }
    });

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const getCategoryTitle = (cat: string) => {
        switch (cat) {
            case 'account': return 'Account Center';
            case 'privacy': return 'Privacy & Visibility';
            case 'notifications': return 'Notifications';
            case 'security': return 'Login & Security';
            case 'display': return 'App Display';
            default: return 'Settings';
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity
                    count={80}
                    magnetRadius={4}
                    ringRadius={4}
                    color={isDark ? "#ffffff" : "#5227FF"}
                />
                <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-30 ${isDark ? 'bg-purple-900/20' : 'bg-purple-200/40'
                    }`} />
            </div>

            <div className="relative z-10 w-full max-w-2xl py-12">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">{getCategoryTitle(category)}</h1>
                        <p className={`text-xs uppercase font-bold tracking-widest opacity-50`}>Configuration</p>
                    </div>
                </div>

                <div className="animate-in slide-in-from-right-4 fade-in duration-500">

                    {category === 'account' && (
                        <>
                            <div className={`p-8 rounded-[2rem] border mb-6 flex flex-col items-center text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'
                                }`}>
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 mb-4">
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl font-black ${isDark ? 'bg-black' : 'bg-white'
                                        }`}>JP</div>
                                </div>
                                <h2 className="text-xl font-bold">Jaimil Patel</h2>
                                <p className="opacity-50 text-sm">@jaimil_p</p>
                            </div>

                            <SettingItem
                                title="Language"
                                description="Application language preference."
                                type="select"
                                value={settings.account.language}
                                onChange={(val: any) => handleChange('language', val)}
                                options={['English (US)', 'Spanish', 'French', 'German']}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Email Address"
                                description={settings.account.email}
                                type="action"
                                onChange={() => alert('Change email flow')}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Password"
                                description="Last changed 3 months ago."
                                type="action"
                                onChange={() => alert('Change password flow')}
                                isDark={isDark}
                            />
                        </>
                    )}

                    {category === 'privacy' && (
                        <>
                            <SettingItem
                                title="Private Profile"
                                description="Only approved followers can see your content."
                                type="toggle"
                                value={settings.privacy.privateProfile}
                                onChange={(val: any) => handleChange('privateProfile', val)}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Activity Status"
                                description="Show when you are active on AEGIS."
                                type="toggle"
                                value={settings.privacy.showActivityStatus}
                                onChange={(val: any) => handleChange('showActivityStatus', val)}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Search Visibility"
                                description="Who can find your profile via search."
                                type="select"
                                value={settings.privacy.searchVisibility}
                                onChange={(val: any) => handleChange('searchVisibility', val)}
                                options={['Global', 'Friends Only', 'Hidden']}
                                isDark={isDark}
                            />
                        </>
                    )}

                    {category === 'notifications' && (
                        <>
                            <SettingItem
                                title="Push Alerts"
                                description="Instant updates on your device."
                                type="toggle"
                                value={settings.notifications.pushAlerts}
                                onChange={(val: any) => handleChange('pushAlerts', val)}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Email Digest"
                                description="Weekly summaries of your network activity."
                                type="toggle"
                                value={settings.notifications.emailDigest}
                                onChange={(val: any) => handleChange('emailDigest', val)}
                                isDark={isDark}
                            />
                        </>
                    )}

                    {category === 'security' && (
                        <>
                            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold flex gap-3 items-center">
                                <Shield className="w-5 h-5" />
                                Your account security is optimal.
                            </div>
                            <SettingItem
                                title="Two-Factor Authentication"
                                description="Secure your login with an extra verification step."
                                type="toggle"
                                value={settings.security.twoFactorAuth}
                                onChange={(val: any) => handleChange('twoFactorAuth', val)}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Active Sessions"
                                description={`Currently active on ${settings.security.activeSessions} devices.`}
                                type="action"
                                onChange={() => alert('Manage sessions')}
                                isDark={isDark}
                            />
                        </>
                    )}

                    {category === 'display' && (
                        <>
                            <SettingItem
                                title="Dark Mode"
                                description="Easier on the eyes, saves battery."
                                type="toggle"
                                value={settings.display.darkMode}
                                onChange={(val: any) => {
                                    handleChange('darkMode', val);
                                    setIsDark(val);
                                }}
                                isDark={isDark}
                            />
                            <SettingItem
                                title="Text Size"
                                description="Adjust the reading size for content."
                                type="select"
                                value={settings.display.textSize}
                                onChange={(val: any) => handleChange('textSize', val)}
                                options={['Small', 'Medium', 'Large']}
                                isDark={isDark}
                            />
                        </>
                    )}

                    {category === 'help' && (
                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
                            <h2 className="text-xl font-bold mb-4">Contact Support</h2>
                            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Have a question or facing an issue? Send us a message and we'll get back to you shortly.
                            </p>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);
                                const issue = formData.get('issue') as string;

                                if (!issue?.trim()) return;

                                const toastId = toast.loading("Submitting ticket...");

                                try {
                                    const { createClient } = await import('@/utils/supabase/client');
                                    const supabase = createClient();
                                    const { data: { user }, error: userError } = await supabase.auth.getUser();

                                    if (userError || !user) throw new Error("Please log in to submit a ticket");

                                    const { error } = await supabase
                                        .from('reports')
                                        .insert({
                                            reporter_id: user.id,
                                            reason: issue,
                                            status: 'pending'
                                        });

                                    if (error) throw error;

                                    toast.success("Ticket submitted successfully!", { id: toastId });
                                    form.reset();

                                } catch (error: any) {
                                    console.error(error);
                                    toast.error(error.message || "Failed to submit ticket", { id: toastId });
                                }
                            }}>
                                <textarea
                                    name="issue"
                                    rows={5}
                                    placeholder="Describe your issue or question here..."
                                    className={`w-full p-4 rounded-xl mb-4 border outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDark
                                        ? 'bg-black/20 border-white/10 text-white placeholder:text-gray-600'
                                        : 'bg-gray-50 border-gray-200 text-black placeholder:text-gray-400'
                                        }`}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:shadow-indigo-500/50 transition-all active:scale-[0.98]"
                                >
                                    Submit Ticket
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
