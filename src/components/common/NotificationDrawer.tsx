import React, { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Info, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Announcement } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  announcements
}) => {
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Academic' | 'Fee Alert'>('All');

  if (!isOpen) return null;

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Urgent') return a.priority === 'Urgent' || a.priority === 'High';
    return a.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications & Announcements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official alerts for students, parents & staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto">
          {(['All', 'Urgent', 'Academic', 'Fee Alert'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-colors ${
                filter === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No notifications matching this filter.</p>
            </div>
          ) : (
            filteredAnnouncements.map((anc) => {
              const isUrgent = anc.priority === 'Urgent' || anc.priority === 'High';
              return (
                <div
                  key={anc.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : anc.category === 'Fee Alert' ? (
                        <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                      }`}>
                        {anc.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{anc.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {anc.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {anc.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Issued by: {anc.author}</span>
                    <span className="font-medium text-slate-500">Target: {anc.targetRole}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl transition-colors"
          >
            Mark All as Read & Close
          </button>
        </div>
      </div>
    </div>
  );
};
