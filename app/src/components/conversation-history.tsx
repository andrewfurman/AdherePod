"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Image as ImageIcon, Clock, MessageCircle } from "lucide-react";

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

function formatLocalTime(utcDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcDate));
}

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

// Group conversations by date
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

function TimelineEntry({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetail = async () => {
    if (detail) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch(`/api/voice/conversations?id=${conversation.id}`);
      if (res.ok) {
        setDetail(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const imageCount = detail?.images?.length || 0;

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />

      {/* Entry card */}
      <button
        onClick={loadDetail}
        className="w-full text-left mb-1"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-sm">
              {conversation.title || "Untitled conversation"}
            </h3>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(conversation.startedAt)}
              </span>
              <span>{formatDuration(conversation.startedAt, conversation.endedAt)}</span>
              {conversation.status === "active" && (
                <span className="text-green-600 font-medium">Active</span>
              )}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </div>
      </button>

      {/* Summary (always visible) */}
      {conversation.summary && !expanded && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {conversation.summary}
        </p>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading transcript...</p>
          ) : detail ? (
            <>
              {/* Summary */}
              {detail.summary && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Summary
                  </p>
                  <p className="text-sm">{detail.summary}</p>
                </div>
              )}

              {/* Transcript */}
              {detail.messages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Transcript
                  </p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {detail.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border"
                          }`}
                        >
                          <p className="font-medium mb-0.5 opacity-70">
                            {msg.role === "user" ? "You" : "AdherePod"}
                          </p>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {detail.images.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Captured Images ({detail.images.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.images.map((img) => (
                      <div
                        key={img.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.description || "Captured image"}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 space-y-1">
                          {img.description && (
                            <p className="text-xs font-medium">{img.description}</p>
                          )}
                          {img.extractedText && (
                            <p className="text-xs text-muted-foreground whitespace-pre-line">
                              {img.extractedText}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground opacity-60">
                            {formatLocalTime(img.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.messages.length === 0 && detail.images.length === 0 && (
                <p className="text-sm text-muted-foreground">No messages or images recorded.</p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Bottom spacing for timeline connector */}
      <div className="pb-6" />
    </div>
  );
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {Array.from(grouped.entries()).map(([dateKey, convs]) => (
        <div key={dateKey}>
          {/* Date header */}
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            {formatDate(convs[0].startedAt)}
          </h2>

          {/* Timeline line */}
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-border" />

            {convs.map((conv) => (
              <TimelineEntry key={conv.id} conversation={conv} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
