import React, { useState } from 'react';
import {
  MessageSquare,
  Bell,
  Send,
  User,
  Shield,
  Search,
  Plus,
  CheckCheck,
  Sparkles,
  Filter,
  Users
} from 'lucide-react';
import { UserRole, Message, Announcement } from '../../types';

interface CommunicationModuleProps {
  currentRole: UserRole;
  messages: Message[];
  announcements: Announcement[];
  onSendMessage: (msg: Partial<Message>) => void;
  onPostAnnouncement: (anc: Partial<Announcement>) => void;
}

export const CommunicationModule: React.FC<CommunicationModuleProps> = ({
  currentRole,
  messages,
  announcements,
  onSendMessage,
  onPostAnnouncement
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements' | 'preferences'>('messages');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0] || null);
  const [replyText, setReplyText] = useState('');

  // Form for posting announcement
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    targetRole: 'All' as 'All' | 'Students' | 'Parents' | 'Teachers',
    category: 'Academic' as 'Academic' | 'Administrative' | 'Events' | 'Fee Alert',
    priority: 'Normal' as 'Normal' | 'Urgent' | 'High'
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;
    onSendMessage({
      senderId: 'usr-current',
      senderName: 'You',
      senderRole: currentRole,
      recipientId: selectedMessage.senderId,
      recipientName: selectedMessage.senderName,
      recipientRole: selectedMessage.senderRole,
      subject: `Re: ${selectedMessage.subject}`,
      text: replyText,
      timestamp: 'Just Now',
      unread: false,
      childContext: selectedMessage.childContext
    });
    setReplyText('');
    alert('Message sent successfully.');
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeData.title || !noticeData.content) return;
    onPostAnnouncement({
      ...noticeData,
      author: 'Administration Office',
      date: new Date().toISOString().slice(0, 10)
    });
    setShowPostNoticeModal(false);
    alert('Notice published to campus network.');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Communication & Notice Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal messaging, teacher-parent direct channel, institute notices & SMS alert preferences
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'messages'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Direct Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Notices ({announcements.length})
          </button>
        </div>
      </div>

      {activeTab === 'messages' ? (
        /* Direct Messages Chat Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Inbox List Sidebar */}
          <div className="border-r border-slate-100 dark:border-slate-800 flex flex-col h-full">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full p-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-300 dark:border-teal-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{msg.subject}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{msg.text}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Detail & Reply */}
          {selectedMessage ? (
            <div className="lg:col-span-2 flex flex-col h-full p-6">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedMessage.subject}</h3>
                    <p className="text-xs text-slate-500">From: {selectedMessage.senderName} ({selectedMessage.senderRole})</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{selectedMessage.timestamp}</span>
                </div>
                {selectedMessage.childContext && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                    Context: {selectedMessage.childContext}
                  </span>
                )}
              </div>

              {/* Chat Message Bubble */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 max-w-lg text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                  {selectedMessage.text}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center text-xs text-slate-400">
              Select a conversation to view messages.
            </div>
          )}
        </div>
      ) : (
        /* Announcements & Notices Tab */
        <div className="space-y-4">
          {(currentRole === 'principal' || currentRole === 'teacher') && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowPostNoticeModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Post Campus Notice
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((anc) => (
              <div key={anc.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {anc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{anc.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{anc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{anc.content}</p>
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Issued by: {anc.author} • Target: {anc.targetRole}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Notice Modal */}
      {showPostNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowPostNoticeModal(false)} />
          <form onSubmit={handleCreateNotice} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Post Official Campus Notice</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Notice Title</label>
              <input
                type="text"
                required
                value={noticeData.title}
                onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                className="w-full p-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                placeholder="e.g. Independence Day Holiday Announcement"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Target Audience</label>
              <select
                value={noticeData.targetRole}
                onChange={(e) => setNoticeData({ ...noticeData, targetRole: e.target.value as any })}
                className="w-full p-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="All">Everyone (Students, Parents & Staff)</option>
                <option value="Parents">Parents Only</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Faculty Only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Notice Content</label>
              <textarea
                rows={4}
                required
                value={noticeData.content}
                onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
                className="w-full p-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                placeholder="Details of the announcement..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowPostNoticeModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl">
                Broadcast Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
