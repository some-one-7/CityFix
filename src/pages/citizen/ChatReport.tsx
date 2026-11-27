import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Image,
  Info,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Trash2,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useComplaints } from "@/store/ComplaintsContext";
import { useToast } from "@/store/ToastContext";
import { CATEGORIES, categoryMeta } from "@/lib/constants";
import { TRANSLATIONS, CATEGORY_LABELS } from "@/lib/translations";
import { buildTimeline, priorityFromScore, scoreFromFactors } from "@/data/complaints";
import { mockId } from "@/lib/utils";
import type { CategoryId, Complaint, PriorityFactors } from "@/types";

interface Message {
  id: string;
  sender: "bot" | "user";
  text?: string;
  time: string;
  type?: "text" | "ai_confirmation" | "contact_form" | "success";
  media?: {
    type: "photo" | "video" | "audio";
    url: string;
    label?: string;
  };
}

export default function ChatReport() {
  const navigate = useNavigate();
  const { addComplaint, selectedCity, language } = useComplaints();
  const { toast } = useToast();
  const t = TRANSLATIONS[language];

  const [step, setStep] = useState<"input" | "analyzing" | "confirm" | "contact" | "done">("input");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Evidence state
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<string | null>(null);

  // AI draft states
  const [aiTitle, setAiTitle] = useState("Severe road crater and exposed cabling");
  const [aiSummary, setAiSummary] = useState(
    "Large road damage and pothole cluster observed near pedestrian lane, creating accident risk for morning commuters."
  );
  const [aiCategory, setAiCategory] = useState<CategoryId>("roads");
  const [aiLocation, setAiLocation] = useState("Market Cross Road, Ward 2");

  // Mandatory reporter details
  const [reporterName, setReporterName] = useState("Ananya Rao");
  const [reporterPhone, setReporterPhone] = useState("+91 9845 220191");
  const [reporterEmail, setReporterEmail] = useState("ananya.rao@example.com");

  const [createdReport, setCreatedReport] = useState<Complaint | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: t.aiGreeting.replace("{city}", selectedCity),
      time: "Just now",
      type: "text",
    },
  ]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === "bot") {
      setMessages([
        {
          id: "msg-1",
          sender: "bot",
          text: t.aiGreeting.replace("{city}", selectedCity),
          time: "Just now",
          type: "text",
        },
      ]);
    }
  }, [language, selectedCity]);

  const handlePlayAudioSummary = () => {
    if (isPlayingAudio) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    let speechText = `You reported: ${aiSummary}. Proposed category: ${CATEGORY_LABELS[language][aiCategory] || aiCategory}. Location: ${aiLocation}. Tap confirm to submit.`;
    if (language === "hi") {
      speechText = `आपकी शिकायत है: ${aiSummary}। श्रेणी: ${CATEGORY_LABELS[language][aiCategory] || aiCategory}। स्थान: ${aiLocation}। सबमिट करने के लिए हरा बटन दबाएं।`;
    } else if (language === "te") {
      speechText = `మీ ఫిర్యాదు: ${aiSummary}। వర్గం: ${CATEGORY_LABELS[language][aiCategory] || aiCategory}। ప్రాంతం: ${aiLocation}। సమర్పించడానికి నిర్ధారించండి.`;
    }

    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-US";
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  // Voice recording simulation timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setPlusMenuOpen(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    const simulatedTranscript =
      "There is a deep cave-in and pothole on Market Cross Road with water accumulation. It has been like this for three days and is very hazardous for bikes.";
    setInputText(simulatedTranscript);
    setAttachedAudio("sample_voice_clip.mp3");
    toast({
      title: "Audio recorded & transcribed",
      description: "Speech converted to text. You can review or tap send.",
      variant: "success",
    });
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !attachedPhoto && !attachedVideo && !attachedAudio) return;

    if (inputText.trim()) {
      const summary = inputText.trim();
      const firstSentence = summary.split(/[.?!]/)[0].trim();
      const title = firstSentence.length > 55 ? firstSentence.slice(0, 52) + "..." : firstSentence;
      setAiTitle(title || "Civic issue reported");
      setAiSummary(summary);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText.trim() || undefined,
      time: "Now",
      media: attachedPhoto
        ? { type: "photo", url: attachedPhoto, label: "Photo evidence" }
        : attachedVideo
        ? { type: "video", url: attachedVideo, label: "Video clip (42s)" }
        : attachedAudio
        ? { type: "audio", url: attachedAudio, label: "Voice note" }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setStep("analyzing");

    // Simulate AI classification & summary generation
    setTimeout(() => {
      setStep("confirm");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "I've analyzed your report. Please review the AI summary and proposed category before we collect your contact verification.",
          time: "Now",
          type: "ai_confirmation",
        },
      ]);
    }, 1200);
  };

  const handleConfirmAi = () => {
    setStep("contact");
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-contact-${Date.now()}`,
        sender: "bot",
        text: "Summary confirmed! Please confirm your mandatory contact details. By privacy policy, only NagarMitra Platform Admins can see your personal info; it is never shared in public posts or authority exports.",
        time: "Now",
        type: "contact_form",
      },
    ]);
  };

  const handleSubmitFinalReport = () => {
    const reportId = mockId();
    const factors: PriorityFactors = { severity: 85, impact: 80, recurrence: 60, urgency: 88 };
    const score = scoreFromFactors(factors);

    const newComplaint: Complaint = {
      id: reportId,
      title: aiTitle,
      description: messages.find((m) => m.sender === "user")?.text ?? aiTitle,
      aiSummary: aiSummary,
      category: aiCategory,
      status: "submitted",
      priority: priorityFromScore(score),
      score,
      factors,
      city: selectedCity,
      location: `${aiLocation}, ${selectedCity}`,
      area: aiLocation.split(",")[0],
      date: new Date().toISOString().split("T")[0],
      updated: new Date().toISOString().split("T")[0],
      photo: attachedPhoto ?? "/evidence/pothole.jpg",
      video: attachedVideo ?? undefined,
      audio: attachedAudio ?? undefined,
      reporter: {
        name: reporterName,
        anonymous: false,
        phone: reporterPhone,
        email: reporterEmail,
        reports: 5,
        trust: 92,
      },
      coordinates: { x: 45, y: 55 },
      upvotes: 1,
      why: [
        "AI multi-factor signal analysis",
        "Confirmed by resident during reporting",
      ],
      timeline: buildTimeline(new Date().toISOString().split("T")[0], "submitted"),
      comments: [
        {
          id: `comm-${Date.now()}`,
          author: reporterName,
          date: new Date().toISOString().split("T")[0],
          text: "Report filed via NagarMitra AI Assistant.",
          badge: "Reporter",
        },
      ],
    };

    addComplaint(newComplaint);
    setCreatedReport(newComplaint);
    setAttachedPhoto(null);
    setAttachedVideo(null);
    setAttachedAudio(null);
    setInputText("");
    setStep("done");

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-success-${Date.now()}`,
        sender: "bot",
        text: `Your civic report ${reportId} has been created and published to the public feed! You can now track its timeline or share it with neighbors.`,
        time: "Now",
        type: "success",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] w-full max-w-2xl mx-auto bg-white sm:border-x sm:border-line sm:shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-line bg-white/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Back to home"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Sparkles size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white" />
            </span>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                NagarMitra AI Assistant
              </h1>
              <p className="text-[9.5px] sm:text-[10px] text-slate-400">
                Civic Triage · {selectedCity} · {language === "hi" ? "हिंदी" : language === "te" ? "తెలుగు" : "English"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Online
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 sm:p-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-brand-600 text-white shadow-sm rounded-br-none"
                  : "bg-slate-50 text-slate-800 border border-line rounded-bl-none"
              }`}
            >
              {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

              {/* Media preview */}
              {msg.media && (
                <div className="mt-2 overflow-hidden rounded-xl border border-white/20 bg-black/10">
                  {msg.media.type === "photo" && (
                    <img src={msg.media.url} alt="" className="h-36 w-full object-cover" />
                  )}
                  {msg.media.type === "video" && (
                    <div className="flex h-28 w-full items-center justify-center bg-slate-900 text-white p-3 text-center">
                      <div>
                        <Video size={24} className="mx-auto mb-1 text-brand-300" />
                        <span className="text-[10px] font-medium">Video attached (max 1 min)</span>
                        <p className="text-[8.5px] text-slate-400">Viewed by staff · Not analyzed by AI</p>
                      </div>
                    </div>
                  )}
                  {msg.media.type === "audio" && (
                    <div className="flex items-center gap-2 bg-brand-700/60 p-2.5 text-white">
                      <Mic size={14} />
                      <span className="text-[11px] font-semibold">Audio Note Recorded</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Confirmation Card */}
            {msg.type === "ai_confirmation" && step === "confirm" && (
              <div className="mt-2 w-full max-w-md rounded-2xl border border-brand-200 bg-brand-50/70 p-4 shadow-sm animate-fade-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    <Sparkles size={13} /> AI Summary & Classification
                  </div>

                  {/* Audio Readback Button for Both Educated and Uneducated Citizens */}
                  <button
                    type="button"
                    onClick={handlePlayAudioSummary}
                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-sm transition ${
                      isPlayingAudio
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-white border border-brand-300 text-brand-700 hover:bg-brand-50"
                    }`}
                    title={isPlayingAudio ? t.stopAudio : t.listenAloud}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX size={13} /> {t.stopAudio}
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} className="text-brand-600" /> {t.listenAloud}
                      </>
                    )}
                  </button>
                </div>

                {isPlayingAudio && (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800 animate-pulse">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{t.speaking}</span>
                  </div>
                )}

                <div className="mt-2.5 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">
                      {language === "hi" ? "शिकायत का सारांश:" : language === "te" ? "ఫిర్యాదు సారాంశం:" : "Proposed Summary:"}
                    </label>
                    <textarea
                      value={aiSummary}
                      onChange={(e) => setAiSummary(e.target.value)}
                      rows={2}
                      className="field mt-0.5 text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">
                        {language === "hi" ? "श्रेणी (Category):" : language === "te" ? "వర్గం (Category):" : "Category:"}
                      </label>
                      <select
                        value={aiCategory}
                        onChange={(e) => setAiCategory(e.target.value as CategoryId)}
                        className="field mt-0.5 text-xs bg-white h-8 py-0"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {CATEGORY_LABELS[language][cat.id] || cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">
                        {language === "hi" ? "स्थान (Location):" : language === "te" ? "ప్రాంతం (Location):" : "Location:"}
                      </label>
                      <input
                        value={aiLocation}
                        onChange={(e) => setAiLocation(e.target.value)}
                        className="field mt-0.5 text-xs bg-white h-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-brand-200/60 pt-2.5">
                  <span className="text-[10px] text-slate-500">{t.editSummary}</span>
                  <button
                    onClick={handleConfirmAi}
                    className="focus-ring flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    {t.confirmProceed} <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Mandatory Contact Details Card */}
            {msg.type === "contact_form" && step === "contact" && (
              <div className="mt-2 w-full max-w-md rounded-2xl border border-line bg-white p-4 shadow-sm animate-fade-up">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Mandatory Reporter Details
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">
                  {t.reporterConfidential}
                </p>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">{t.reporterName}</label>
                    <input
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="field mt-0.5 text-xs h-8"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">{t.reporterPhone}</label>
                      <input
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        className="field mt-0.5 text-xs h-8"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">{t.reporterEmail}</label>
                      <input
                        type="email"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className="field mt-0.5 text-xs h-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitFinalReport}
                  disabled={!reporterName || !reporterPhone || !reporterEmail}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                >
                  <Check size={14} /> {t.yesSubmit}
                </button>
              </div>
            )}

            {/* Success Card */}
            {msg.type === "success" && createdReport && (
              <div className="mt-2 w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm animate-fade-up">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    {t.reportPublished} · ID #{createdReport.id}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-800">
                  {language === "hi"
                    ? "आपकी शिकायत दर्ज हो गई है और संबंधित वार्ड टीम को भेज दी गई है।"
                    : language === "te"
                    ? "మీ ఫిర్యాదు నమోదైంది మరియు వార్డు అధికారులకు పంపబడింది."
                    : "Your complaint is live on the city feed and queued for ward triage."}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/reports/${createdReport.id}`}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    {t.viewDetails}
                  </Link>
                  <Link
                    to="/explore"
                    className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-center text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    Public Feed
                  </Link>
                </div>
              </div>
            )}

            <span className="mt-1 text-[9.5px] text-slate-400">{msg.time}</span>
          </div>
        ))}

        {step === "analyzing" && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-line p-3 text-xs text-slate-500 animate-pulse w-fit">
            <Sparkles size={14} className="text-brand-600" />
            AI is analyzing audio & photos, generating summary & priority...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Attachments Preview bar if selected */}
      {(attachedPhoto || attachedVideo || attachedAudio) && (
        <div className="flex items-center gap-2 border-t border-line bg-slate-50 px-4 py-2 text-xs shrink-0">
          <span className="font-semibold text-slate-600">Attached:</span>
          {attachedPhoto && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-line px-2 py-0.5 text-[11px] text-slate-700">
              <Camera size={11} className="text-brand-600" /> Photo evidence
              <button onClick={() => setAttachedPhoto(null)} className="ml-1 text-slate-400 hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          )}
          {attachedVideo && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-line px-2 py-0.5 text-[11px] text-slate-700">
              <Video size={11} className="text-brand-600" /> Video (≤1 min)
              <button onClick={() => setAttachedVideo(null)} className="ml-1 text-slate-400 hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          )}
          {attachedAudio && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-line px-2 py-0.5 text-[11px] text-slate-700">
              <Mic size={11} className="text-brand-600" /> Audio note
              <button onClick={() => setAttachedAudio(null)} className="ml-1 text-slate-400 hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Plus (+) Menu Drawer */}
      {plusMenuOpen && (
        <div className="border-t border-line bg-white p-3 shrink-0 animate-fade-up">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Attach Evidence</span>
            <button onClick={() => setPlusMenuOpen(false)}>
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => {
                setAttachedPhoto("/evidence/pothole.jpg");
                setPlusMenuOpen(false);
                toast({ title: "Photo attached", description: "Evidence photo added to report.", variant: "info" });
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line p-2.5 transition hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
                <Camera size={16} />
              </span>
              <span className="font-semibold text-slate-700">Photo</span>
              <span className="text-[9px] text-slate-400">Analyzed by AI</span>
            </button>

            <button
              onClick={() => {
                setAttachedVideo("/evidence/sample_video.mp4");
                setPlusMenuOpen(false);
                toast({
                  title: "Video attached (max 1 min)",
                  description: "Stored for human review only (not analyzed by AI).",
                  variant: "info",
                });
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line p-2.5 transition hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <Video size={16} />
              </span>
              <span className="font-semibold text-slate-700">Video</span>
              <span className="text-[9px] text-purple-600 font-medium">No AI · Human only</span>
            </button>

            <button
              onClick={() => {
                startRecording();
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-line p-2.5 transition hover:border-brand-300 hover:bg-brand-50/50"
            >
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Mic size={16} />
              </span>
              <span className="font-semibold text-slate-700">Audio Clip</span>
              <span className="text-[9px] text-slate-400">Analyzed by AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Recording Waveform Banner */}
      {isRecording && (
        <div className="flex items-center justify-between border-t border-red-200 bg-red-50/80 px-4 py-2.5 text-red-700 shrink-0 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
            <span>Recording voice... ({recordingSeconds}s / 60s max)</span>
          </div>
          <button
            onClick={stopRecording}
            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-red-700"
          >
            Done
          </button>
        </div>
      )}

      {/* Chat Input Bar - Docked Cleanly at Bottom */}
      <div className="border-t border-line bg-white p-2.5 sm:p-3 shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <div className="flex items-center gap-2">
          {/* Plus (+) Button */}
          <button
            type="button"
            onClick={() => setPlusMenuOpen((prev) => !prev)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
              plusMenuOpen ? "border-brand-500 bg-brand-50 text-brand-600" : "border-line bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
            title="Attach Media Evidence"
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              language === "hi"
                ? "समस्या लिखें या माइक दबाएं..."
                : language === "te"
                ? "సమస్యను టైప్ చేయండి లేదా మాట్లాడండి..."
                : "Type your complaint or click mic..."
            }
            disabled={step === "analyzing" || isRecording}
            className="field h-10 flex-1 px-3 text-xs placeholder:text-slate-400"
          />

          {/* Mic Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
              isRecording
                ? "border-red-500 bg-red-500 text-white"
                : "border-line bg-slate-50 text-slate-600 hover:text-brand-600"
            }`}
            title={isRecording ? "Stop recording" : t.quickSpeak}
          >
            <Mic size={17} />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !attachedPhoto && !attachedVideo && !attachedAudio}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-40"
            title="Send"
          >
            <Send size={15} />
          </button>
        </div>

        <p className="mt-1.5 text-center text-[9px] text-slate-400">
          NagarMitra AI analyzes text, voice & photos. Video is stored for human inspection only.
        </p>
      </div>
    </div>
  );
}
