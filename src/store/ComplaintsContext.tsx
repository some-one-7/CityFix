import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMPLAINTS, advanceComplaint } from "@/data/complaints";
import type { Language } from "@/lib/translations";
import type { Comment, Complaint, StatusId } from "@/types";

interface ComplaintsContextValue {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateStatus: (id: string, status: StatusId, note?: string) => Complaint | undefined;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  escalateComplaint: (id: string, authorityTag: string, sla?: string, note?: string) => void;
  upvote: (id: string) => void;
  addComment: (complaintId: string, text: string, author?: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ComplaintsContext = createContext<ComplaintsContextValue | null>(null);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [selectedCity, setSelectedCity] = useState<string>("Riverton");
  const [language, setLanguage] = useState<Language>("en");

  const addComplaint = useCallback((complaint: Complaint) => {
    setComplaints((current) => [complaint, ...current]);
  }, []);

  const updateStatus = useCallback(
    (id: string, status: StatusId, note?: string) => {
      let updated: Complaint | undefined;
      setComplaints((current) =>
        current.map((complaint) => {
          if (complaint.id !== id) return complaint;
          updated = advanceComplaint(complaint, status, note);
          return updated;
        })
      );
      return updated;
    },
    []
  );

  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    setComplaints((current) =>
      current.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              updated: new Date().toISOString().split("T")[0],
            }
          : c
      )
    );
  }, []);

  const escalateComplaint = useCallback(
    (id: string, authorityTag: string, sla = "Urgent 24hr", note = "") => {
      const today = new Date().toISOString().split("T")[0];
      setComplaints((current) =>
        current.map((c) => {
          if (c.id !== id) return c;
          const escalationComment: Comment = {
            id: `esc-${Date.now()}`,
            author: "City Operations Admin",
            date: today,
            text: `Public Escalation dispatched to ${authorityTag} (${sla}). ${note || "Official triage initiated."}`,
            badge: "Official Action",
          };
          return {
            ...c,
            escalatedTo: authorityTag,
            escalationSla: sla,
            escalationNote: note,
            status: c.status === "submitted" ? "review" : c.status,
            updated: today,
            comments: [...(c.comments ?? []), escalationComment],
            timeline: c.timeline.map((event, idx) =>
              idx === 0
                ? { ...event, note: `${event.note} · Escalated to ${authorityTag}` }
                : event
            ),
          };
        })
      );
    },
    []
  );

  const upvote = useCallback((id: string) => {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id
          ? { ...complaint, upvotes: complaint.upvotes + 1 }
          : complaint
      )
    );
  }, []);

  const addComment = useCallback((complaintId: string, text: string, author = "Ananya Rao") => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      author,
      date: new Date().toISOString().split("T")[0],
      text: text.trim(),
      badge: "Verified Resident",
    };
    setComplaints((current) =>
      current.map((c) =>
        c.id === complaintId
          ? { ...c, comments: [...(c.comments ?? []), newComment] }
          : c
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      complaints,
      addComplaint,
      updateStatus,
      updateComplaint,
      escalateComplaint,
      upvote,
      addComment,
      selectedCity,
      setSelectedCity,
      language,
      setLanguage,
    }),
    [
      complaints,
      addComplaint,
      updateStatus,
      updateComplaint,
      escalateComplaint,
      upvote,
      addComment,
      selectedCity,
      setSelectedCity,
      language,
      setLanguage,
    ]
  );

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (!context) {
    throw new Error("useComplaints must be used inside ComplaintsProvider");
  }
  return context;
}

export function useComplaint(id: string | undefined) {
  const { complaints } = useComplaints();
  return complaints.find((complaint) => complaint.id === id);
}
