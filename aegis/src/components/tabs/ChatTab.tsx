"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Camera,
  Info,
  Image as ImageIcon,
  Heart,
  Smile,
  Mic,
  Users,
  X,
  CheckCircle2,
  Edit2,
  Save
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { chatService, Conversation, Message } from '@/services/chat';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ChatTabProps {
  isDark: boolean;
  // Ignoring the passed users prop as we fetch real users now
  users?: any[];
}

const ChatTab: React.FC<ChatTabProps> = ({ isDark }) => {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]); // For searching users to chat with
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group Management State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupLogo, setGroupLogo] = useState("");
  const [groupDetails, setGroupDetails] = useState<Record<string, { name?: string, logo?: string }>>({});

  // 1. Fetch Auth User
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch Conversations & Profiles
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      // Load conversations
      try {
        const { data: participations, error: pError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', currentUser.id);

        if (pError) throw pError;

        const conversationIds = participations.map(p => p.conversation_id);

        if (conversationIds.length > 0) {
          const { data: convos, error: cError } = await supabase
            .from('conversations')
            .select(`
                *,
                conversation_participants(
                  user_id,
                  joined_at,
                  profiles(*)
                ),
                messages(
                  id,
                  content,
                  created_at,
                  sender_id,
                  is_read
                )
            `)
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

          if (cError) throw cError;

          // Sort messages to find the last one and extract group info
          const processed = convos.map((c: any) => {
            const sortedMessages = c.messages?.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ) || [];

            let groupName, groupLogo;
            if (c.is_group) {
              // Find latest group update
              const updateMsg = sortedMessages.find((m: any) => m.content.startsWith('{"type":"system"'));
              if (updateMsg) {
                try {
                  const data = JSON.parse(updateMsg.content);
                  if (data.action === 'update_group') {
                    groupName = data.name;
                    groupLogo = data.logo;
                  }
                } catch (e) {
                  // ignore malformed
                }
              }
            }

            return {
              ...c,
              participants: c.conversation_participants,
              last_message: sortedMessages.find((m: any) => !m.content.startsWith('{"type":"system"')) || sortedMessages[0],
              groupName, // Derived from history
              groupLogo
            };
          });
          setConversations(processed);
        }

        // Load all profiles for search
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser.id) // Exclude self
          .eq('role', 'user'); // Filter for users only

        if (allProfiles) setProfiles(allProfiles);

      } catch (error: any) {
        console.error("Error loading chat data:", error.message || error);
      }
    };

    loadData();

    // Realtime subscription for new messages
    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // 3. Load Messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, sender:profiles(*)`)
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (data) setMessages(data as any);
    };

    fetchMessages();

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`conversation:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`
      }, async (payload) => {
        // Fetch the sender profile for the new message
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.sender_id)
          .single();

        const newMessage = { ...payload.new, sender: senderProfile } as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Scan messages for group updates
  useEffect(() => {
    if (!messages.length || !selectedConversation?.is_group) return;

    // Find the last system message with group info
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      try {
        if (msg.content.startsWith('{"type":"system"')) {
          const data = JSON.parse(msg.content);
          if (data.action === 'update_group') {
            setGroupDetails(prev => ({
              ...prev,
              [selectedConversation.id]: {
                name: data.name,
                logo: data.logo
              }
            }));
            break;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [messages, selectedConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessageRaw = async (content: string) => {
    if (!content.trim() || !currentUser || !selectedConversation) return;

    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        content: content
      });

      if (!content.startsWith('{"type":"system"')) {
        setNewMessage("");
      }

      // Optimistically update updated_at for conversation list sorting
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, updated_at: new Date().toISOString() }
            : c
        );
        return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = (overrideContent?: string) => {
    handleSendMessageRaw(overrideContent || newMessage);
  };

  const handleUpdateGroup = async () => {
    if (!selectedConversation || !groupName.trim()) return;

    const payload = JSON.stringify({
      type: 'system',
      action: 'update_group',
      name: groupName,
      logo: groupLogo
    });

    await handleSendMessage(payload);
    setIsEditingGroup(false);
  };

  const handleCreateChat = async () => {
    if (!currentUser || selectedForGroup.length === 0) return;

    // Check for existing DM
    if (selectedForGroup.length === 1) {
      const targetUserId = selectedForGroup[0];
      const existingDM = conversations.find(c =>
        !c.is_group &&
        c.participants.some((p: any) => p.user_id === targetUserId)
      );

      if (existingDM) {
        setSelectedConversation(existingDM);
        setIsCreatingChat(false);
        setSelectedForGroup([]);
        return;
      }
    }

    try {
      // atomic creation using RPC function to bypass RLS race condition
      const { data: conversationId, error: rpcError } = await supabase.rpc('create_conversation_rpc', {
        is_group: selectedForGroup.length > 1,
        participant_ids: [currentUser.id, ...selectedForGroup]
      });

      if (rpcError) throw rpcError;

      // Refresh conversations
      setIsCreatingChat(false);
      setSelectedForGroup([]);

      // Trigger reload to fetch the new conversation
      window.location.reload();

    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedForGroup.includes(userId)) {
      setSelectedForGroup(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedForGroup(prev => [...prev, userId]);
    }
  };


  const getConversationName = (c: Conversation & { groupName?: string }) => {
    if (!currentUser) return "";

    // Check pre-calculated or local cache
    if (c.is_group) {
      if (groupDetails[c.id]?.name) return groupDetails[c.id].name;
      if (c.groupName) return c.groupName;
    }

    if (c.is_group) {
      // Join names of other participants
      const names = c.participants
        .filter((p: any) => p.user_id !== currentUser.id)
        .map((p: any) => p.profiles?.handle ? `@${p.profiles.handle}` : (p.profiles?.full_name || 'Unknown'))
        .join(', ');
      return names || "Group Chat";
    } else {
      // Find the other person
      const other = c.participants.find((p: any) => p.user_id !== currentUser.id);
      return other?.profiles?.handle ? `@${other.profiles.handle}` : (other?.profiles?.full_name || "User");
    }
  };

  const getConversationAvatar = (c: Conversation & { groupLogo?: string }) => {
    if (!currentUser) return "";

    if (c.is_group) {
      if (groupDetails[c.id]?.logo) return <img src={groupDetails[c.id].logo} alt="Group" className="w-full h-full object-cover" />;
      if (c.groupLogo) return <img src={c.groupLogo} alt="Group" className="w-full h-full object-cover" />;
    }

    if (c.is_group) {
      // Keep it simple for group defaults
      return <Users className="w-5 h-5" />;
    } else {
      const other = c.participants.find((p: any) => p.user_id !== currentUser.id);
      return other?.profiles?.avatar_url ? (
        <img src={other.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="text-sm font-bold">{other?.profiles?.full_name?.[0] || "?"}</div>
      );
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-6 px-4 md:px-6 max-w-[1200px] mx-auto h-screen max-h-[900px]">
      <div className={`h-full flex rounded-2xl border overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
        }`}>

        {/* Sidebar */}
        <div className={`w-24 md:w-96 border-r flex flex-col transition-colors ${isDark ? 'border-white/10 bg-black' : 'border-black/5 bg-white'}`}>
          {/* Sidebar Header */}
          <div className="p-6 md:p-8 flex items-center justify-center md:justify-between">
            <h3 className="hidden md:block font-bold text-xl tracking-tight">
              {currentUser?.handle || "Messages"}
            </h3>
            <div className="flex gap-4">
              <Plus
                className={`w-7 h-7 cursor-pointer hover:opacity-70 ${isCreatingChat ? 'rotate-45' : ''} transition-transform`}
                onClick={() => setIsCreatingChat(!isCreatingChat)}
              />
            </div>
          </div>

          {/* User List / Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-4 space-y-2">

            {isCreatingChat ? (
              <div className="space-y-4">
                <p className="px-4 text-xs font-bold opacity-50 uppercase">New Message</p>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="mx-4 p-2 rounded bg-gray-100 dark:bg-zinc-800 w-[85%]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                {/* User Selection List */}
                {profiles
                  .filter(p => !searchQuery || p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 ${selectedForGroup.includes(user.id) ? 'bg-blue-500/10' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700`}>
                        {user.avatar_url ? <img src={user.avatar_url} /> : user.full_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">@{user.handle}</p>
                        <p className="text-xs opacity-50">{user.full_name}</p>
                      </div>
                      {selectedForGroup.includes(user.id) && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    </div>
                  ))}

                {selectedForGroup.length > 0 && (
                  <button
                    onClick={handleCreateChat}
                    className="w-[90%] mx-auto block py-2 bg-blue-600 text-white rounded-lg font-bold text-sm mt-4"
                  >
                    Start Chat ({selectedForGroup.length})
                  </button>
                )}
              </div>
            ) : (
              conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className={`flex items-center justify-center md:justify-start gap-4 p-3 md:p-4 rounded-xl cursor-pointer transition-all ${selectedConversation?.id === c.id
                    ? (isDark ? 'bg-white/10' : 'bg-gray-100')
                    : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      {getConversationAvatar(c)}
                    </div>
                  </div>
                  <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm font-semibold truncate ${selectedConversation?.id === c.id ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                        {getConversationName(c)}
                      </p>
                      {/* Time would go here */}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {c.last_message ? (c.last_message.content.startsWith('{"type":"system"') ? 'Group updated' : c.last_message.content) : "No messages yet"}
                    </p>
                  </div>
                </div>
              ))
            )}

            {!isCreatingChat && conversations.length === 0 && (
              <div className="text-center p-8 opacity-50">
                <p>No conversations yet.</p>
                <button onClick={() => setIsCreatingChat(true)} className="text-blue-500 text-sm mt-2 font-bold">Start a chat</button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col relative ${isDark ? 'bg-black' : 'bg-white'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-500/20 flex items-center justify-center font-bold">
                    {getConversationAvatar(selectedConversation)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base leading-tight">
                        {getConversationName(selectedConversation)}
                      </p>
                      {selectedConversation.is_group && (
                        <Edit2 className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100" onClick={() => {
                          setGroupName(getConversationName(selectedConversation) || "");
                          setIsEditingGroup(true);
                        }} />
                      )}
                    </div>
                    {selectedConversation.is_group && (
                      <p className="text-xs text-gray-500 font-medium">{selectedConversation.participants.length} participants</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-gray-500">
                  <Info className="w-6 h-6 cursor-pointer hover:text-current transition-colors" />
                </div>
              </div>

              {/* Edit Group Modal Overlay */}
              {isEditingGroup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <div className={`p-6 rounded-2xl w-full max-w-sm md:max-w-md ${isDark ? 'bg-zinc-900 border border-white/10' : 'bg-white'} h-[80vh] md:h-auto md:max-h-[85vh] flex flex-col shadow-2xl`}>
                    <h3 className="text-lg font-bold mb-4 flex-shrink-0">Edit Group Info</h3>

                    <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2 pb-2">
                      {/* Name */}
                      <div>
                        <label className="text-xs font-bold uppercase opacity-50 block mb-2">Group Name</label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={e => setGroupName(e.target.value)}
                          className="w-full p-3 rounded-xl bg-transparent border border-gray-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      {/* Logo */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase opacity-50 block">Group Logo</label>
                          {groupLogo && (
                            <span
                              onClick={() => setGroupLogo("")}
                              className="text-[10px] text-red-500 font-bold cursor-pointer hover:underline">
                              Remove Logo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center overflow-hidden relative group cursor-pointer border border-white/10 flex-shrink-0"
                            onClick={() => document.getElementById('group-logo-upload')?.click()}
                          >
                            {groupLogo ? (
                              <img src={groupLogo} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center opacity-50">
                                <Users className="w-6 h-6 mb-1" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={groupLogo}
                              onChange={e => setGroupLogo(e.target.value)}
                              placeholder="Enter URL or upload..."
                              className="w-full p-3 rounded-xl bg-transparent border border-gray-500/20 text-xs mb-2 truncate"
                            />
                            <button
                              onClick={() => document.getElementById('group-logo-upload')?.click()}
                              className="text-xs font-bold text-blue-500 hover:text-blue-400"
                            >
                              Upload from Gallery
                            </button>
                          </div>
                        </div>
                        <input
                          id="group-logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !selectedConversation) return;

                            if (file.size > 5 * 1024 * 1024) {
                              alert("File is too large. Please choose an image under 5MB.");
                              return;
                            }

                            const formData = new FormData();
                            formData.append('logo', file);

                            try {
                              const { uploadGroupLogo } = await import('@/actions/profile');
                              const result = await uploadGroupLogo(selectedConversation.id, formData);
                              if (result.error) {
                                alert(result.error);
                              } else if (result.logoUrl) {
                                setGroupLogo(result.logoUrl);
                              }
                            } catch (error) {
                              console.error('Upload failed', error);
                            }
                          }}
                        />
                      </div>

                      {/* Participants */}
                      <div>
                        <label className="text-xs font-bold uppercase opacity-50 block mb-2">Participants ({selectedConversation.participants.length})</label>
                        <div className="bg-gray-500/5 rounded-xl overflow-hidden">
                          {selectedConversation.participants
                            .sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime())
                            .map((p: any) => {
                              const isMe = p.user_id === currentUser?.id;
                              const sorted = [...selectedConversation.participants].sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime());
                              const adminId = sorted[0]?.user_id;
                              const isUserAdmin = p.user_id === adminId;
                              const amIAdmin = currentUser?.id === adminId;

                              return (
                                <div key={p.user_id} className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center overflow-hidden text-[10px] font-bold">
                                      {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} className="w-full h-full object-cover" /> : p.profiles?.handle?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">@{p.profiles?.handle}</span>
                                        {isUserAdmin && <span className="text-[9px] bg-blue-500 text-white px-1.5 rounded-full font-bold">ADMIN</span>}
                                      </div>
                                    </div>
                                  </div>
                                  {(amIAdmin && !isMe) && (
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Remove @${p.profiles?.handle} from the group?`)) {
                                          const { removeUserFromGroup } = await import('@/actions/chat');
                                          await removeUserFromGroup(selectedConversation.id, p.user_id);
                                          window.location.reload();
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5 mt-4">
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditingGroup(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-500/10 hover:bg-gray-500/20 transition-colors">Cancel</button>
                        <button onClick={handleUpdateGroup} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Save Changes</button>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to leave this group?')) {
                            const { leaveGroup } = await import('@/actions/chat');
                            await leaveGroup(selectedConversation.id);
                            window.location.reload();
                          }
                        }}
                        className="w-full py-3 rounded-xl font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors">
                        Leave Group
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 md:space-y-8 flex flex-col">
                {messages.filter(m => !m.content.startsWith('{"type":"system"')).map((msg, index) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3 group max-w-[85%]`}>
                      {!isMe && (
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 self-end mb-1 flex items-center justify-center font-bold text-[10px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                          {msg.sender?.avatar_url ? <img src={msg.sender.avatar_url} /> : (msg.sender?.handle?.[0] || msg.sender?.full_name?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                      <div className={`p-4 rounded-3xl ${isMe ? 'rounded-br-none bg-blue-600 text-white' : `rounded-bl-none ${isDark ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-black'}`}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer Input */}
              <div className="p-4 md:p-6 pb-6 md:pb-8">
                <div className={`flex items-center gap-3 p-1.5 md:p-2 pl-4 rounded-[2rem] border transition-all ${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'}`}>
                  <div className="p-1.5 bg-blue-500 rounded-full cursor-pointer hover:opacity-90 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message..."
                    className={`focus:outline-none focus:ring-0 flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-normal ${isDark ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
                  />

                  {newMessage && (
                    <button
                      onClick={() => handleSendMessage()}
                      className="px-4 py-2 font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-50 flex-col gap-4">
              <div className="w-20 h-20 bg-gray-500/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10" />
              </div>
              <p>Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default ChatTab;
