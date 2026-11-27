import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Headphones,
  Info,
  Languages,
  Mic,
  Pause,
  Pencil,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/store/ToastContext";
import { cn } from "@/lib/utils";

const TRANSCRIPT =
  "There is a large pothole near the main road outside the local market. It has been there for several days and is dangerous for bikers.";

const AI_SUMMARY =
  "Large pothole reported near the local market, creating a safety risk for commuters.";

const MAX_SECONDS = 90;

function Waveform({
  active,
  playing,
  bars = 48,
}: {
  active: boolean;
  playing?: boolean;
  bars?: number;
}) {
  const heights = useMemo(
    () =>
      Array.from({ length: bars }, (_, index) => {
        const value = Math.abs(Math.sin(index * 1.31) * Math.cos(index * 0.47));
        return Math.round(8 + value * 30);
      }),
    [bars]
  );

  return (
    <div className="flex h-12 items-center justify-center gap-[3px]" aria-hidden>
      {heights.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] rounded-full transition-colors",
            active ? "bg-brand-500" : "bg-slate-300",
            playing && "bg-accent-500"
          )}
          style={{
            height: active || playing ? height : Math.max(5, height * 0.45),
            animationName: active || playing ? "wave" : undefined,
            animationDuration: "1s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${(index % 10) * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phase, setPhase] = useState<"idle" | "recording" | "recorded">("idle");
  const [seconds, setSeconds] = useState(0);
  const [summary, setSummary] = useState(AI_SUMMARY);
  const [draft, setDraft] = useState(AI_SUMMARY);
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "recording") {
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(() => {
      setSeconds((value) => {
        if (value + 1 >= MAX_SECONDS) {
          window.clearInterval(timer.current!);
          setPhase("recorded");
          return MAX_SECONDS;
        }
        return value + 1;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [phase]);

  const start = () => {
    setSeconds(0);
    setPlaying(false);
    setPhase("recording");
  };

  const stop = () => {
    setPhase("recorded");
    setSeconds((value) => Math.max(value, 9));
    toast({
      title: "Recording saved",
      description: "Demo transcript and summary generated below.",
      variant: "success",
    });
  };

  const reset = () => {
    setPhase("idle");
    setSeconds(0);
    setPlaying(false);
    setEditing(false);
    setSummary(AI_SUMMARY);
    setDraft(AI_SUMMARY);
  };

  const saveEdit = () => {
    if (draft.trim().length < 10) {
      toast({ title: "Summary too short", variant: "error" });
      return;
    }
    setSummary(draft.trim());
    setEditing(false);
    toast({ title: "Summary updated", variant: "success" });
  };

  const duration = `00:${String(seconds || 9).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
            <Mic size={16} />
          </span>
          <h1 className="text-[22px] font-extrabold sm:text-2xl">Voice report</h1>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          Describe the issue in your own words. NagarMitra turns your recording into a structured
          complaint — no typing needed.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
          <Languages size={14} className="text-slate-400" />
          English (India)
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Simulated demo
        </span>
      </div>

      <div className="surface overflow-hidden">
        <div className="border-b border-line bg-slate-50/60 px-5 pb-5 pt-7">
          <div className="flex flex-col items-center">
            <div className="relative flex h-[148px] w-[148px] items-center justify-center">
              {phase === "recording" ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-300/40 animate-pulse-ring" />
                  <span className="absolute inset-4 rounded-full bg-red-200/40 animate-pulse-ring [animation-delay:0.6s]" />
                </>
              ) : phase === "idle" ? (
                <>
                  <span className="absolute inset-2 rounded-full border border-brand-100" />
                  <span className="absolute inset-6 rounded-full border border-brand-100/70" />
                </>
              ) : null}

              <button
                onClick={() => {
                  if (phase === "idle") start();
                  else if (phase === "recording") stop();
                  else reset();
                }}
                className={cn(
                  "focus-ring relative flex h-[104px] w-[104px] items-center justify-center rounded-full text-white shadow-lift transition duration-200 hover:scale-[1.03] active:scale-95",
                  phase === "recording" ? "bg-red-500 hover:bg-red-600" : "bg-brand-600 hover:bg-brand-700"
                )}
                aria-label={
                  phase === "idle"
                    ? "Start recording"
                    : phase === "recording"
                      ? "Stop recording"
                      : "Record again"
                }
              >
                {phase === "recording" ? (
                  <Square size={30} fill="currentColor" strokeWidth={0} />
                ) : phase === "recorded" ? (
                  <RotateCcw size={28} />
                ) : (
                  <Mic size={38} strokeWidth={1.9} />
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="font-display text-sm font-bold text-slate-800">
                {phase === "idle"
                  ? "Tap the microphone to start"
                  : phase === "recording"
                    ? "Listening…"
                    : "Voice note recorded"}
              </p>
              <p className="mt-1 text-[11.5px] text-slate-500">
                {phase === "idle"
                  ? "Speak clearly, then tap stop when you're done."
                  : phase === "recording"
                    ? "Describe the location, the issue and how long it has been there."
                    : "Review the transcript and AI summary below."}
              </p>
              {phase !== "idle" ? (
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 font-mono text-[11px] font-semibold text-slate-600">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      phase === "recording" ? "bg-red-500 animate-pulse" : "bg-accent-500"
                    )}
                  />
                  {duration}
                  <span className="font-sans text-[10px] font-normal text-slate-400">/ 01:30</span>
                </div>
              ) : null}
            </div>

            <div className="mt-2 w-full max-w-sm">
              <Waveform
                active={phase === "recording"}
                playing={phase === "recorded" && playing}
              />
            </div>

            {phase === "recording" ? (
              <button
                onClick={stop}
                className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-red-600"
              >
                <Square size={11} fill="currentColor" strokeWidth={0} />
                Stop recording
              </button>
            ) : null}
          </div>
        </div>

        {phase === "recorded" ? (
          <div className="space-y-4 p-4 sm:p-5">
            {/* Mock playback */}
            <div className="flex items-center gap-3 rounded-xl border border-line bg-slate-50/70 p-3">
              <button
                onClick={() => setPlaying((value) => !value)}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
                aria-label={playing ? "Pause demo playback" : "Play demo playback"}
              >
                {playing ? <Pause size={14} /> : <Headphones size={15} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-slate-700">Your recording</p>
                  <span className="font-mono text-[10px] text-slate-400">{duration}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={cn(
                      "h-full rounded-full bg-brand-500 transition-all duration-1000",
                      playing ? "w-full" : "w-0"
                    )}
                  />
                </div>
              </div>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 ring-1 ring-line">
                demo
              </span>
            </div>

            {/* Transcript */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Transcript
                </p>
                <span className="text-[10px] text-slate-400">Speech-to-text · simulated</span>
              </div>
              <div className="rounded-xl border border-line bg-white p-3.5 text-[12.5px] leading-relaxed text-slate-700">
                {TRANSCRIPT}
              </div>
            </div>

            {/* AI summary */}
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white p-1.5 text-brand-600 shadow-sm">
                    <Sparkles size={14} />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-slate-800">AI-generated summary</p>
                    <p className="text-[10px] text-slate-500">Sample output for this prototype</p>
                  </div>
                </div>
                {!editing ? (
                  <button
                    onClick={() => {
                      setDraft(summary);
                      setEditing(true);
                    }}
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2 py-1 text-[10.5px] font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                ) : null}
              </div>

              {editing ? (
                <div className="mt-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    className="field resize-none text-[12.5px]"
                    aria-label="Edit AI summary"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{draft.length}/220 characters</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        <X size={12} /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={draft.length > 220}>
                        <Check size={12} /> Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-2.5 text-[13px] leading-relaxed text-slate-700">{summary}</p>
              )}

              <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                <Info size={11} className="mt-0.5 shrink-0" />
                Generated from the sample transcript above. No real speech recognition or AI
                service is connected in Phase 1.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={reset} className="sm:order-1">
                <RotateCcw size={15} />
                Record again
              </Button>
              <Button
                className="sm:order-2"
                onClick={() =>
                  navigate("/report/manual", {
                    state: {
                      title: "Large pothole near the local market",
                      description: TRANSCRIPT,
                      aiSummary: summary,
                      category: "roads",
                      fromVoice: true,
                    },
                  })
                }
              >
                Continue to details
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4">
            <div className="grid gap-2.5 sm:grid-cols-3">
              {[
                { title: "Speak", text: "Say what you see and where it is." },
                { title: "Review", text: "Check the transcript and summary." },
                { title: "Confirm", text: "Add a photo and location, then submit." },
              ].map((step, index) => (
                <div key={step.title} className="rounded-xl border border-line bg-slate-50/50 p-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] font-bold text-brand-600 ring-1 ring-line">
                    {index + 1}
                  </span>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-slate-700">{step.title}</p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              <p className="text-[10.5px] text-slate-400">
                Max recording length 90 seconds in this demo.
              </p>
              <Link
                to="/report/manual"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
              >
                Skip, report manually
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
