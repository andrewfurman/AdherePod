"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Camera, Clock, Mail, MessageCircle, Trash2, CheckCircle, Eye, MousePointerClick, AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface EmailSend {
  id: string;
  userId: string | null;
  recipientEmail: string;
  messageType: string;
  subject: string;
  sgMessageId: string | null;
  sentAt: string;
  latestEvent: string | null;
}

interface EmailEvent {
  id: string;
  event: string;
  timestamp: string;
  metadata: string | null;
}

interface EmailDetail extends EmailSend {
  htmlBody: string;
  events: EmailEvent[];
}

type HistoryItem =
  | { type: "conversation"; data: Conversation }
  | { type: "email"; data: EmailSend };

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

function emailTypeLabel(type: string): string {
  switch (type) {
    case "password_reset": return "Password Reset";
    case "medication_reminder": return "Medication Reminder";
    case "daily_summary": return "Daily Summary";
    default: return type;
  }
}

function eventIcon(event: string) {
  switch (event) {
    case "delivered": return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    case "open": return <Eye className="h-3.5 w-3.5 text-blue-500" />;
    case "click": return <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />;
    case "bounce":
    case "dropped":
    case "spamreport":
      return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
    default: return <Mail className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function eventBadge(event: string) {
  const styles: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    open: "bg-blue-100 text-blue-700",
    click: "bg-purple-100 text-purple-700",
    bounce: "bg-red-100 text-red-700",
    dropped: "bg-red-100 text-red-700",
    spamreport: "bg-red-100 text-red-700",
    deferred: "bg-yellow-100 text-yellow-700",
    processed: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    delivered: "Delivered",
    open: "Opened",
    click: "Clicked",
    bounce: "Bounced",
    dropped: "Dropped",
    spamreport: "Spam",
    deferred: "Deferred",
    processed: "Sent",
  };
  const cls = styles[event] || "bg-gray-100 text-gray-600";
  const label = labels[event] || event;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cls}`}>
      {eventIcon(event)}
      {label}
    </span>
  );
}

function groupByDate(items: HistoryItem[]): Map<string, HistoryItem[]> {
  const groups = new Map<string, HistoryItem[]>();
  for (const item of items) {
    const date = item.type === "conversation" ? item.data.startedAt : item.data.sentAt;
    const dateKey = new Date(date).toLocaleDateString();
    const existing = groups.get(dateKey) || [];
    existing.push(item);
    groups.set(dateKey, existing);
  }
  return groups;
}

function getItemDate(item: HistoryItem): string {
  return item.type === "conversation" ? item.data.startedAt : item.data.sentAt;
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

interface ConversationHistoryProps {
  viewAsUserId?: string;
  patientId?: string;
}

export default function ConversationHistory({ viewAsUserId, patientId }: ConversationHistoryProps = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [emails, setEmails] = useState<EmailSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"conversation" | "email" | null>(null);
  const [convDetail, setConvDetail] = useState<ConversationDetail | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const pendingImageDirection = useRef<"first" | "last" | null>(null);

  const viewAsParam = viewAsUserId ? `?viewAs=${viewAsUserId}` : "";
  const patientParam = patientId ? `?patientId=${patientId}` : "";

  const fetchData = useCallback(async () => {
    try {
      // Use patientId param for provider context, viewAs for admin impersonation
      const convQuery = patientId ? `?patientId=${patientId}` : viewAsParam;
      const emailQuery = patientId ? `?patientId=${patientId}` : viewAsParam;
      const [convRes, emailRes] = await Promise.all([
        fetch(`/api/voice/conversations${convQuery}`),
        fetch(`/api/emails${emailQuery}`),
      ]);
      if (convRes.ok) setConversations(await convRes.json());
      if (emailRes.ok) setEmails(await emailRes.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [viewAsParam, patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/voice/conversations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setConvDetail(null);
          setShowDetail(false);
        }
      }
    } catch {
      // silently fail
    }
  };

  const selectItem = async (id: string, type: "conversation" | "email") => {
    if (id === selectedId && type === selectedType) {
      setShowDetail(true);
      return;
    }
    setSelectedId(id);
    setSelectedType(type);
    setConvDetail(null);
    setEmailDetail(null);
    setDetailLoading(true);
    setShowDetail(true);

    try {
      const extra = patientId ? `&patientId=${patientId}` : viewAsUserId ? `&viewAs=${viewAsUserId}` : "";
      if (type === "conversation") {
        const res = await fetch(`/api/voice/conversations?id=${id}${extra}`);
        if (res.ok) setConvDetail(await res.json());
      } else {
        const res = await fetch(`/api/emails?id=${id}${extra}`);
        if (res.ok) setEmailDetail(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false);
    }
  };

  const goBackToList = () => {
    setShowDetail(false);
  };

  // Merge conversations and emails into a single chronological list
  const historyItems: HistoryItem[] = useMemo(() => [
    ...conversations.map((c) => ({ type: "conversation" as const, data: c })),
    ...emails.map((e) => ({ type: "email" as const, data: e })),
  ].sort((a, b) => new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime()), [conversations, emails]);

  const grouped = useMemo(() => groupByDate(historyItems), [historyItems]);
  const timeline = useMemo(() => convDetail ? mergeTimeline(convDetail) : [], [convDetail]);

  // Build list of images in the current conversation for lightbox navigation
  const currentImages = useMemo(() => {
    return timeline.filter((item): item is TimelineItem & { type: "image" } => item.type === "image");
  }, [timeline]);

  // When convDetail changes, check if we need to open lightbox at a pending position
  useEffect(() => {
    if (pendingImageDirection.current && convDetail) {
      const imgs = mergeTimeline(convDetail).filter((item) => item.type === "image");
      if (imgs.length > 0) {
        setLightboxImageIndex(pendingImageDirection.current === "first" ? 0 : imgs.length - 1);
      }
      pendingImageDirection.current = null;
    }
  }, [convDetail]);

  const navigateImage = useCallback((direction: -1 | 1) => {
    if (lightboxImageIndex === null) return;
    const newIndex = lightboxImageIndex + direction;
    if (newIndex >= 0 && newIndex < currentImages.length) {
      setLightboxImageIndex(newIndex);
      return;
    }
    // Cross-conversation navigation
    const sortedConvs = [...conversations].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );
    const sortedIdx = sortedConvs.findIndex((c) => c.id === convDetail?.id);
    if (sortedIdx === -1) return;
    const nextSortedIdx = direction === 1 ? sortedIdx + 1 : sortedIdx - 1;
    if (nextSortedIdx < 0 || nextSortedIdx >= sortedConvs.length) return;
    const nextConv = sortedConvs[nextSortedIdx];
    pendingImageDirection.current = direction === 1 ? "first" : "last";
    selectItem(nextConv.id, "conversation");
  }, [lightboxImageIndex, currentImages.length, conversations, convDetail, selectItem]);

  // Keyboard and scroll lock for lightbox
  useEffect(() => {
    if (lightboxImageIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateImage(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateImage(1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxImageIndex, navigateImage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (conversations.length === 0 && emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          No history yet. Start a voice chat or receive an email to see your history here.
        </p>
      </div>
    );
  }

  // Sidebar content
  const sidebarContent = (
    <>
      {Array.from(grouped.entries()).map(([dateKey, items]) => (
        <div key={dateKey}>
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {formatDate(getItemDate(items[0]))}
            </p>
          </div>
          {items.map((item) => {
            const isConv = item.type === "conversation";
            const id = isConv ? item.data.id : item.data.id;
            const isSelected = selectedId === id && selectedType === item.type;

            if (isConv) {
              const conv = item.data;
              return (
                <button
                  key={`conv-${conv.id}`}
                  onClick={() => selectItem(conv.id, "conversation")}
                  className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${
                    isSelected ? "bg-background shadow-sm" : "hover:bg-background/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                      {conv.title || "Untitled conversation"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground ml-5.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(conv.startedAt)}
                    </span>
                    <span>{formatDuration(conv.startedAt, conv.endedAt)}</span>
                  </div>
                </button>
              );
            }

            const email = item.data;
            return (
              <button
                key={`email-${email.id}`}
                onClick={() => selectItem(email.id, "email")}
                className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${
                  isSelected ? "bg-background shadow-sm" : "hover:bg-background/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      To: {email.recipientEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground ml-5.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(email.sentAt)}
                  </span>
                  <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                    {emailTypeLabel(email.messageType)}
                  </span>
                  {email.latestEvent ? eventBadge(email.latestEvent) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                      <Mail className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );

  // Detail content
  const detailContent = (
    <>
      {!selectedId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageCircle className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Select an item to view</p>
        </div>
      ) : detailLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : selectedType === "conversation" && convDetail ? (
        <>
          {/* Conversation header */}
          <div className="shrink-0 px-4 sm:px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {convDetail.title || "Untitled conversation"}
              </h2>
              {!viewAsUserId && !patientId && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this conversation and all its messages and images. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteConversation(convDetail.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        autoFocus
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{formatDate(convDetail.startedAt)}</span>
              <span>{formatTime(convDetail.startedAt)}</span>
              <span>{formatDuration(convDetail.startedAt, convDetail.endedAt)}</span>
            </div>
          </div>

          {/* Conversation messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
            {convDetail.summary && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Summary
                </p>
                <p className="text-sm">{convDetail.summary}</p>
              </div>
            )}

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

                  const img = item.data;
                  const imgIndex = currentImages.findIndex((i) => i.data.id === img.id);
                  return (
                    <div key={`img-${img.id}`} className="flex justify-center">
                      <div
                        className="w-full max-w-sm border border-border rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => setLightboxImageIndex(imgIndex)}
                      >
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
                            <p className="text-sm font-medium line-clamp-2">{img.description}</p>
                          )}
                          {img.extractedText && (
                            <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-2">
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
      ) : selectedType === "email" && emailDetail ? (
        <>
          {/* Email header */}
          <div className="shrink-0 px-4 sm:px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{emailDetail.subject}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>To: {emailDetail.recipientEmail}</span>
              <span>{formatDate(emailDetail.sentAt)}</span>
              <span>{formatTime(emailDetail.sentAt)}</span>
              <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                {emailTypeLabel(emailDetail.messageType)}
              </span>
            </div>
          </div>

          {/* Email body + events */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
            {/* Delivery events timeline */}
            {emailDetail.events.length > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Delivery Status
                </p>
                <div className="space-y-1.5">
                  {emailDetail.events.map((evt) => (
                    <div key={evt.id} className="flex items-center gap-2 text-sm">
                      {eventIcon(evt.event)}
                      <span className="font-medium capitalize">{evt.event}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email HTML body */}
            <div className="border border-border rounded-lg overflow-hidden">
              <iframe
                srcDoc={emailDetail.htmlBody}
                title="Email preview"
                className="w-full min-h-[300px] bg-white"
                sandbox=""
              />
            </div>
          </div>
        </>
      ) : null}
    </>
  );

  return (
    <>
      {/* Desktop layout: side-by-side */}
      <div className="hidden md:flex h-full border border-border rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-border overflow-y-auto bg-muted/30">
          {sidebarContent}
        </div>
        {/* Detail pane */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {detailContent}
        </div>
      </div>

      {/* Mobile layout: list or detail with back button */}
      <div className="md:hidden h-full border border-border rounded-lg overflow-hidden">
        {!showDetail ? (
          <div className="h-full overflow-y-auto bg-muted/30">
            {sidebarContent}
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="shrink-0 px-3 py-2 border-b border-border bg-muted/30">
              <button
                onClick={goBackToList}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to history
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {detailContent}
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxImageIndex !== null && currentImages[lightboxImageIndex] && (() => {
        const img = currentImages[lightboxImageIndex].data;
        const hasPrev = lightboxImageIndex > 0 || (() => {
          const sortedConvs = [...conversations].sort(
            (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
          );
          const idx = sortedConvs.findIndex((c) => c.id === convDetail?.id);
          return idx > 0;
        })();
        const hasNext = lightboxImageIndex < currentImages.length - 1 || (() => {
          const sortedConvs = [...conversations].sort(
            (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
          );
          const idx = sortedConvs.findIndex((c) => c.id === convDetail?.id);
          return idx < sortedConvs.length - 1;
        })();
        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxImageIndex(null)}
          >
            <div
              className="relative w-full max-w-5xl max-h-[90vh] bg-background rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxImageIndex(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur p-1.5 text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image section */}
              <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[250px] md:min-h-0">
                <img
                  src={img.imageUrl}
                  alt={img.description || "Captured image"}
                  className="w-full h-full max-h-[50vh] md:max-h-[90vh] object-contain"
                />

                {/* Prev arrow */}
                {hasPrev && (
                  <button
                    onClick={() => navigateImage(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur p-1.5 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Next arrow */}
                {hasNext && (
                  <button
                    onClick={() => navigateImage(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur p-1.5 text-foreground hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Image counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-foreground">
                  {lightboxImageIndex + 1} / {currentImages.length}
                </div>
              </div>

              {/* Text section */}
              <div className="md:w-2/5 overflow-y-auto p-5 space-y-4 max-h-[40vh] md:max-h-[90vh]">
                {img.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed">{img.description}</p>
                  </div>
                )}
                {img.extractedText && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Extracted Text
                    </h3>
                    <div className="bg-muted rounded-lg p-3 font-mono text-xs whitespace-pre-line leading-relaxed">
                      {img.extractedText}
                    </div>
                  </div>
                )}
                {!img.description && !img.extractedText && (
                  <p className="text-sm text-muted-foreground">No text extracted from this image.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
