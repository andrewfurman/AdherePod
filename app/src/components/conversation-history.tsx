"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronLeft, Image as ImageIcon, Clock } from "lucide-react";

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

function formatDuration(start: string, end: string | null): string {
  if (!end) return "In progress";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "< 1 min";
  return `${minutes} min`;
}

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
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

  const viewConversation = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/voice/conversations?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Card className="flex flex-col min-h-0">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <CardTitle>
              {selected ? "Conversation" : "History"}
            </CardTitle>
          </div>
          {selected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto">
        {/* Conversation detail view */}
        {selected ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="space-y-1">
              <h3 className="font-medium text-sm">
                {selected.title || "Untitled conversation"}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatLocalTime(selected.startedAt)}
                </span>
                <span>{formatDuration(selected.startedAt, selected.endedAt)}</span>
              </div>
              {selected.summary && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                  {selected.summary}
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Transcript
              </h4>
              {selected.messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {selected.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border"
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
              )}
            </div>

            {/* Images */}
            {selected.images.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Captured Images
                </h4>
                <div className="space-y-3">
                  {selected.images.map((img) => (
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
                          <p className="text-xs text-muted-foreground">
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
          </div>
        ) : detailLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading conversations...
          </p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No conversations yet. Start a voice chat to see your history here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => viewConversation(conv.id)}
                className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.title || "Untitled conversation"}
                    </p>
                    {conv.summary && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {conv.summary}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                      conv.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {conv.status === "active" ? "Active" : formatDuration(conv.startedAt, conv.endedAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatLocalTime(conv.startedAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
