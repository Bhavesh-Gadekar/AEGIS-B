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
  Save,
  UserPlus
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { chatService, Conversation, Message } from '@/services/chat';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ChatTabProps {
  isDark: boolean;
  users?: any[];
}

const ChatTab: React.FC<ChatTabProps> = ({ isDark }) => {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group Management State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupLogo, setGroupLogo] = useState("");
  const [groupDetails, setGroupDetails] = useState<Record<string, { name?: string, logo?: string }>>({});

  // Add Participants State
  const [addPeopleQuery, setAddPeopleQuery] = useState("");
  const [selectedForAdd, setSelectedForAdd] = useState<string[]>([]);

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

          // Sort messages
          const processed = convos.map((c: any) => {
            const sortedMessages = c.messages?.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ) || [];

            let groupName, groupLogo;
            if (c.is_group) {
              const updateMsg = sortedMessages.find((m: any) => m.content.startsWith('{"type":"system"'));
              if (updateMsg) {
                try {
                  const data = JSON.parse(updateMsg.content);
                  if (data.action === 'update_group') {
                    groupName = data.name;
                    groupLogo = data.logo;
                  }
                } catch (e) { }
              }
            }

            // Count unread messages (not sent by current user)
            const unreadCount = c.messages?.filter((m: any) =>
              !m.is_read && m.sender_id !== currentUser?.id
            ).length || 0;

            return {
              ...c,
              participants: c.conversation_participants,
              last_message: sortedMessages.find((m: any) => !m.content.startsWith('{"type":"system"')) || sortedMessages[0],
              groupName,
              groupLogo,
              unreadCount
            };
          });
          setConversations(processed);
        }

        // Load all profiles for search
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser.id)
          .eq('role', 'user');

        if (allProfiles) setProfiles(allProfiles);

      } catch (error: any) {
        console.error("Error loading chat data:", error.message || error);
      }
    };

    loadData();

    // Realtime subscription for all conversations
    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new as any;
        // If message is in a different conversation and not sent by me, increment unread
        if (newMsg.conversation_id !== selectedConversation?.id && newMsg.sender_id !== currentUser?.id) {
          setConversations(prev => prev.map(c =>
            c.id === newMsg.conversation_id
              ? { ...c, unreadCount: ((c as any).unreadCount || 0) + 1 }
              : c
          ));
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, () => {
        // Reload data when messages are updated (e.g., marked as read from another device)
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

      // Mark all unread messages as read
      if (currentUser) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', selectedConversation.id)
          .eq('is_read', false)
          .neq('sender_id', currentUser.id);

        // Update conversations state to reflect read messages
        setConversations(prev => prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, unreadCount: 0 }
            : c
        ));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`
      }, async (payload) => {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.sender_id)
          .single();

        const newMessage = { ...payload.new, sender: senderProfile } as Message;
        setMessages(prev => [...prev, newMessage]);

        // Mark as read if not sent by me
        if (payload.new.sender_id !== currentUser?.id) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // System messages grouping
  useEffect(() => {
    if (!messages.length || !selectedConversation?.is_group) return;
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
      } catch (e) { }
    }
  }, [messages, selectedConversation]);

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
      const { data: conversationId, error: rpcError } = await supabase.rpc('create_conversation_rpc', {
        is_group: selectedForGroup.length > 1,
        participant_ids: [currentUser.id, ...selectedForGroup]
      });

      if (rpcError) throw rpcError;

      setIsCreatingChat(false);
      setSelectedForGroup([]);
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

  const toggleAddUserSelection = (userId: string) => {
    if (selectedForAdd.includes(userId)) {
      setSelectedForAdd(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedForAdd(prev => [...prev, userId]);
    }
  };

  const handleAddParticipants = async () => {
    if (!selectedConversation || selectedForAdd.length === 0) return;
    try {
      const { addParticipants } = await import('@/actions/chat');
      const { error } = await addParticipants(selectedConversation.id, selectedForAdd);

      if (error) {
        alert(error);
      } else {
        // If successful, send a system message
        const newNames = profiles
          .filter(p => selectedForAdd.includes(p.id))
          .map(p => p.handle || p.full_name)
          .join(', ');

        await handleSendMessageRaw(`{"type":"system","content":"Added ${newNames} to the chat"}`);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getConversationName = (c: Conversation & { groupName?: string }) => {
    if (!currentUser) return "";
    if (c.is_group) {
      if (groupDetails[c.id]?.name) return groupDetails[c.id].name;
      if (c.groupName) return c.groupName;
    }
    if (c.is_group) {
      const names = c.participants
        .filter((p: any) => p.user_id !== currentUser.id)
        .map((p: any) => p.profiles?.handle ? `@${p.profiles.handle}` : (p.profiles?.full_name || 'Unknown'))
        .join(', ');
      return names || "Group Chat";
    } else {
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
                    {(c as any).unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-md">
                        {(c as any).unreadCount > 99 ? '99+' : (c as any).unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm font-semibold truncate ${selectedConversation?.id === c.id ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                        {getConversationName(c)}
                      </p>
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
                    </div>
                    {selectedConversation.is_group && (
                      <p className="text-xs text-gray-500 font-medium">{selectedConversation.participants.length} participants</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-gray-500">
                  <Info
                    className="w-6 h-6 cursor-pointer hover:text-current transition-colors"
                    onClick={() => {
                      const conversationData = selectedConversation as any;
                      setGroupName(getConversationName(selectedConversation) || "");
                      setGroupLogo(conversationData.groupLogo || "");
                      setIsEditingGroup(true);
                      setAddPeopleQuery("");
                      setSelectedForAdd([]);
                    }}
                  />
                </div>
              </div>

              {/* Edit Group / Info Modal */}
              {isEditingGroup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] transition-all ${isDark ? 'bg-zinc-950 border border-white/10' : 'bg-white'}`}>

                    {/* Header */}
                    <div className={`p-3 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
                      <h3 className="font-bold text-base">
                        {selectedConversation.is_group ? 'Group Settings' : 'Chat Details'}
                      </h3>
                      <button
                        onClick={() => setIsEditingGroup(false)}
                        className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      >
                        <X className="w-4 h-4 opacity-70" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                      {/* Group Identity Section */}
                      {selectedConversation.is_group && (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative group">
                            <div
                              onClick={() => document.getElementById('group-logo-upload')?.click()}
                              className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-4 cursor-pointer transition-transform group-hover:scale-105 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-white shadow-sm'}`}
                            >
                              {groupLogo ? (
                                <img src={groupLogo} className="w-full h-full object-cover" />
                              ) : (
                                <Users className={`w-8 h-8 ${isDark ? 'text-zinc-700' : 'text-gray-400'}`} />
                              )}

                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white/90" />
                              </div>
                            </div>

                            {/* X Button for Quick Removal */}
                            {groupLogo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGroupLogo("");
                                }}
                                className="absolute -top-1 -right-1 z-10 p-1.5 bg-red-500 rounded-full text-white shadow-md hover:bg-red-600 transition-colors"
                                title="Remove Logo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}

                            <input
                              id="group-logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("File too large (max 5MB)");
                                  return;
                                }
                                const formData = new FormData();
                                formData.append('logo', file);
                                try {
                                  const { uploadGroupLogo } = await import('@/actions/profile');
                                  const result = await uploadGroupLogo(selectedConversation.id, formData);
                                  if (result.logoUrl) setGroupLogo(result.logoUrl);
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            />
                          </div>

                          {/* Explicit Text Option for Removal */}
                          {groupLogo && (
                            <button
                              onClick={() => setGroupLogo("")}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline -mt-2"
                            >
                              Remove Photo
                            </button>
                          )}

                          <div className="w-full px-8">
                            <input
                              type="text"
                              value={groupName}
                              onChange={e => setGroupName(e.target.value)}
                              placeholder="Group Name"
                              className={`w-full p-2 text-center font-bold text-base bg-transparent border-b focus:border-blue-500 transition-colors focus:outline-none ${isDark ? 'border-zinc-800 focus:bg-white/5' : 'border-gray-200 focus:bg-gray-50'}`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Participants Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <label className="text-[10px] font-bold uppercase opacity-60">
                            Participants <span className="opacity-50">({selectedConversation.participants.length})</span>
                          </label>
                        </div>

                        <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                          {selectedConversation.participants
                            .sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime())
                            .map((p: any) => {
                              const isMe = p.user_id === currentUser?.id;
                              const sorted = [...selectedConversation.participants].sort((a: any, b: any) => new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime());
                              const adminId = sorted[0]?.user_id;
                              const isUserAdmin = p.user_id === adminId;
                              const amIAdmin = currentUser?.id === adminId;

                              return (
                                <div key={p.user_id} className={`flex items-center justify-between p-2.5 border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-[10px] font-bold shadow-sm ${isDark ? 'bg-zinc-800' : 'bg-white border'}`}>
                                      {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} className="w-full h-full object-cover" /> : p.profiles?.handle?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold">@{p.profiles?.handle}</span>
                                        {isUserAdmin && (
                                          <span className="text-[8px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm shadow-blue-500/20">
                                            ADMIN
                                          </span>
                                        )}
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
                                      className="group/btn p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                                      title="Remove User"
                                    >
                                      <X className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Add Participants Section - Compact */}
                      <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/30 border-dashed border-white/10' : 'bg-gray-50/50 border-dashed border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 bg-blue-500/10 rounded-md">
                            <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <span className="text-xs font-bold">Add Participants</span>
                        </div>

                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                          <input
                            type="text"
                            placeholder="Search friends..."
                            className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${isDark ? 'bg-zinc-950 border border-white/10' : 'bg-white border border-gray-200'}`}
                            value={addPeopleQuery}
                            onChange={(e) => setAddPeopleQuery(e.target.value)}
                          />
                        </div>

                        {addPeopleQuery && (
                          <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 mb-2 pr-1">
                            {profiles
                              .filter(p => {
                                const isAlreadyIn = selectedConversation.participants.some((mp: any) => mp.user_id === p.id);
                                const matchesSearch = !addPeopleQuery || p.full_name?.toLowerCase().includes(addPeopleQuery.toLowerCase()) || p.handle?.toLowerCase().includes(addPeopleQuery.toLowerCase());
                                return !isAlreadyIn && matchesSearch;
                              })
                              .map(user => (
                                <div
                                  key={user.id}
                                  onClick={() => toggleAddUserSelection(user.id)}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${selectedForAdd.includes(user.id)
                                    ? (isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200')
                                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}>
                                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.handle?.[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">@{user.handle}</p>
                                  </div>
                                  {selectedForAdd.includes(user.id) ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                                  ) : (
                                    <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-white/10' : 'border-gray-300'}`} />
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        )}

                        <button
                          onClick={handleAddParticipants}
                          disabled={selectedForAdd.length === 0}
                          className={`w-full py-2 rounded-lg font-bold text-xs transition-all shadow-md ${selectedForAdd.length > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/25 active:scale-95'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                          {selectedForAdd.length > 0 ? `Add ${selectedForAdd.length} User${selectedForAdd.length > 1 ? 's' : ''}` : 'Select to add'}
                        </button>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className={`p-3 border-t flex flex-col gap-2.5 ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-gray-100 bg-gray-50'}`}>
                      {selectedConversation.is_group && (
                        <button onClick={handleUpdateGroup} className="w-full py-2.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black transition-colors shadow-md">Save Changes</button>
                      )}

                      {selectedConversation.is_group && (
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to leave this group?')) {
                              const { leaveGroup } = await import('@/actions/chat');
                              await leaveGroup(selectedConversation.id);
                              window.location.reload();
                            }
                          }}
                          className="w-full py-2.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/5 transition-colors">
                          Leave Group
                        </button>
                      )}
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
