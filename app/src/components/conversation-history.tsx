"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Clock, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  status: string;
  title: string | null;
  summary: string | null;
  startedAt: string;
  endedAt: string | null;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  toolName: string | null;
  createdAt: string;
}

interface ImageCapture {
  id: string;
  imageUrl: string;
  extractedText: string | null;
  description: string | null;
  extractedMedications: string | null;
  createdAt: string;
}

interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
  images: ImageCapture[];
}

type TimelineItem =
  | { type: "message"; data: ConversationMessage }
  | { type: "image"; data: ImageCapture };

function formatDate(utcDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(utcDate));
}

function formatTime(utcDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(new Date(utcDate));
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "In progress";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "< 1 min";
  return `${minutes} min`;
}

function groupByDate(conversations: Conversation[]): Map<string, Conversation[]> {
  const groups = new Map<string, Conversation[]>();
  for (const conv of conversations) {
    const dateKey = new Date(conv.startedAt).toLocaleDateString();
    const existing = groups.get(dateKey) || [];
    existing.push(conv);
    groups.set(dateKey, existing);
  }
  return groups;
}

function mergeTimeline(detail: ConversationDetail): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const msg of detail.messages) {
    items.push({ type: "message", data: msg });
  }
  for (const img of detail.images) {
    items.push({ type: "image", data: img });
  }
  items.sort(
    (a, b) =>
      new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime()
  );
  return items;
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/voice/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const selectConversation = async (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/voice/conversations?id=${id}`);
      if (res.ok) {
        setDetail(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading conversation history...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          No conversations yet. Start a voice chat to see your history here.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(conversations);
  const timeline = detail ? mergeTimeline(detail) : [];

  return (
    <div className="h-full flex border border-border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-border overflow-y-auto bg-muted/30">
        {Array.from(grouped.entries()).map(([dateKey, convs]) => (
          <div key={dateKey}>
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {formatDate(convs[0].startedAt)}
              </p>
            </div>
            {convs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${
                  selectedId === conv.id
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/60"
                }`}
              >
                <p className={`text-sm font-medium truncate ${selectedId === conv.id ? "text-foreground" : "text-foreground/80"}`}>
                  {conv.title || "Untitled conversation"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(conv.startedAt)}
                  </span>
                  <span>{formatDuration(conv.startedAt, conv.endedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Detail pane */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">Select a conversation to view</p>
          </div>
        ) : detailLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading conversation...</p>
          </div>
        ) : detail ? (
          <>
            {/* Header */}
            <div className="shrink-0 px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {detail.title || "Untitled conversation"}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{formatDate(detail.startedAt)}</span>
                <span>{formatTime(detail.startedAt)}</span>
                <span>{formatDuration(detail.startedAt, detail.endedAt)}</span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Summary */}
              {detail.summary && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Summary
                  </p>
                  <p className="text-sm">{detail.summary}</p>
                </div>
              )}

              {/* Merged timeline: messages + inline images */}
              {timeline.length > 0 && (
                <div className="space-y-3">
                  {timeline.map((item) => {
                    if (item.type === "message") {
                      const msg = item.data;
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={`msg-${msg.id}`}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                              isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="font-medium text-xs mb-1 opacity-60">
                              {isUser ? "You" : "AdherePod"}
                            </p>
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    // Inline image capture
                    const img = item.data;
                    return (
                      <div key={`img-${img.id}`} className="flex justify-center">
                        <div className="w-full max-w-sm border border-border rounded-lg overflow-hidden bg-muted/50">
                          <img
                            src={img.imageUrl}
                            alt={img.description || "Captured image"}
                            className="w-full h-48 object-cover"
                          />
                          <div className="px-3 py-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <Camera className="h-3 w-3" />
                              Image Capture
                            </div>
                            {img.description && (
                              <p className="text-sm font-medium">{img.description}</p>
                            )}
                            {img.extractedText && (
                              <p className="text-xs text-muted-foreground whitespace-pre-line">
                                {img.extractedText}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No messages or images recorded.
                </p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
