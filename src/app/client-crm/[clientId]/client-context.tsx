"use client";

import { createContext, useContext, useRef, useState } from "react";
import type {
  Client, ChecklistItemKey, OnboardingStepKey, OnboardingStepStatus, ClientKeyDates, ClientStatus,
  ClientSurveyCycle, SurveyCycleStatus,
} from "@/types/client";
import {
  TODAY_ISO, TODAY, getActiveCycle, clientStatusForCycleStatus, CYCLE_STATUS_CONFIG,
  makeChecklist, makeOnboarding, makeKeyDates,
} from "@/lib/mock-clients";

// The currently "logged in" LPS admin persona used throughout the app's
// top nav (src/components/layout/TopNav.tsx) — reused here as the actor
// recorded against checklist completions.
const CURRENT_USER = "Heran Patel";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "warning";
}

interface ClientCtxValue {
  client: Client;
  activeCycle: ClientSurveyCycle | null;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  toggleChecklistItem: (cycleId: string, key: ChecklistItemKey) => void;
  updateKeyDates: (cycleId: string, patch: Partial<ClientKeyDates>) => void;
  setOnboardingStepStatus: (cycleId: string, key: OnboardingStepKey, status: OnboardingStepStatus) => void;
  requestOnboardingStepAction: (cycleId: string, key: OnboardingStepKey) => void;
  sendFinalizationEmail: (cycleId: string) => void;
  setClientStatus: (status: ClientStatus) => void;
  setCycleStatus: (cycleId: string, status: SurveyCycleStatus) => void;
  /** Returns the id of the cycle that was (re)started, so callers can select it in a cycle picker. */
  startOnboarding: () => string;
  launchSurvey: (cycleId: string) => void;
}

const ClientCtx = createContext<ClientCtxValue | null>(null);

export function ClientProvider({ initialClient, children }: { initialClient: Client; children: React.ReactNode }) {
  const [client, setClient] = useState<Client>(initialClient);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(1);

  function pushToast(message: string, tone: Toast["tone"] = "success") {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function findCycle(cycleId: string): ClientSurveyCycle | undefined {
    return client.surveys.find((s) => s.id === cycleId);
  }

  // Note: every action below computes its toast message from the current
  // `client` closure *before* calling setClient, and calls pushToast as a
  // plain statement afterward — never from inside setClient's updater
  // function. React may invoke a functional state updater more than once
  // per commit (e.g. to check purity in dev), so triggering side effects
  // like pushToast from within one can silently double-fire them.

  function toggleChecklistItem(cycleId: string, key: ChecklistItemKey) {
    const cycle = findCycle(cycleId);
    if (!cycle) return;
    const item = cycle.checklist.find((c) => c.key === key);
    const willBeDone = item ? !item.done : true;
    const willCompleteAll = willBeDone && cycle.checklist.every((c) => c.key === key || c.done);

    setClient((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) =>
        s.id !== cycleId
          ? s
          : {
              ...s,
              checklist: s.checklist.map((c) =>
                c.key === key
                  ? willBeDone
                    ? { ...c, done: true, completedAt: TODAY_ISO, completedBy: CURRENT_USER }
                    : { ...c, done: false, completedAt: null, completedBy: null }
                  : c
              ),
            }
      ),
    }));

    if (willCompleteAll) {
      pushToast(`All checklist items complete for ${cycle.name} '${String(cycle.year).slice(2)} — ready to launch.`, "success");
    }
  }

  function updateKeyDates(cycleId: string, patch: Partial<ClientKeyDates>) {
    setClient((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) => (s.id === cycleId ? { ...s, keyDates: { ...s.keyDates, ...patch } } : s)),
    }));
    pushToast("Key dates saved.", "success");
  }

  function setOnboardingStepStatus(cycleId: string, key: OnboardingStepKey, status: OnboardingStepStatus) {
    const cycle = findCycle(cycleId);
    const willCompleteAll =
      !!cycle && status === "approved" && cycle.onboarding.every((s) => s.key === key || s.status === "approved");

    setClient((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) =>
        s.id !== cycleId ? s : { ...s, onboarding: s.onboarding.map((o) => (o.key === key ? { ...o, status, updatedAt: TODAY_ISO } : o)) }
      ),
    }));

    if (willCompleteAll && cycle) {
      pushToast(`Onboarding for ${cycle.name} '${String(cycle.year).slice(2)} is fully approved.`, "success");
    }
  }

  function requestOnboardingStepAction(cycleId: string, key: OnboardingStepKey) {
    const cycle = findCycle(cycleId);
    const step = cycle?.onboarding.find((s) => s.key === key);
    if (!cycle || !step) return;
    const isFirstRequest = step.status === "not_started";

    setClient((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) =>
        s.id !== cycleId
          ? s
          : {
              ...s,
              onboarding: s.onboarding.map((o) =>
                o.key === key
                  ? { ...o, status: o.status === "not_started" ? "in_progress" : o.status, lastEmailSentAt: TODAY_ISO }
                  : o
              ),
            }
      ),
    }));

    pushToast(
      isFirstRequest
        ? `Request sent to ${client.primaryContactName} to complete "${step.label}".`
        : `Reminder sent to ${client.primaryContactName} for "${step.label}".`,
      "success"
    );
  }

  function sendFinalizationEmail(cycleId: string) {
    setClient((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) =>
        s.id !== cycleId
          ? s
          : {
              ...s,
              onboarding: s.onboarding.map((o) =>
                o.key === "finalization" ? { ...o, status: "approved", updatedAt: TODAY_ISO, lastEmailSentAt: TODAY_ISO } : o
              ),
              checklist: s.checklist.map((c) =>
                (c.key === "email_template_sent" || c.key === "finalization_email") && !c.done
                  ? { ...c, done: true, completedAt: TODAY_ISO, completedBy: CURRENT_USER }
                  : c
              ),
            }
      ),
    }));
    pushToast(`Finalization email sent to ${client.primaryContactName}.`, "success");
  }

  function setClientStatus(status: ClientStatus) {
    setClient((prev) => ({ ...prev, status }));
    pushToast("Client status updated.", "info");
  }

  function setCycleStatus(cycleId: string, status: SurveyCycleStatus) {
    setClient((prev) => ({
      ...prev,
      status: clientStatusForCycleStatus(status),
      surveys: prev.surveys.map((s) => (s.id === cycleId ? { ...s, status } : s)),
    }));
    pushToast(`Cycle status updated to ${CYCLE_STATUS_CONFIG[status].label}.`, "info");
  }

  function startOnboarding() {
    const active = getActiveCycle(client);

    if (active) {
      setClient((prev) => ({
        ...prev,
        status: prev.status === "prospect" ? "onboarding" : prev.status,
        surveys: prev.surveys.map((s) =>
          s.id !== active.id
            ? s
            : {
                ...s,
                checklist: s.checklist.map((c) =>
                  c.key === "onboarding_email" && !c.done
                    ? { ...c, done: true, completedAt: TODAY_ISO, completedBy: CURRENT_USER }
                    : c
                ),
                onboarding: s.onboarding.map((o) =>
                  o.key === "questions" && o.status === "not_started"
                    ? { ...o, status: "in_progress", updatedAt: TODAY_ISO, lastEmailSentAt: TODAY_ISO }
                    : o
                ),
              }
        ),
      }));
      pushToast(`Onboarding email re-sent to ${client.primaryContactName}.`, "success");
      return active.id;
    }

    const mostRecent = [...client.surveys].sort((a, b) => b.year - a.year)[0];
    const newYear = (mostRecent?.year ?? TODAY.getFullYear() - 1) + 1;
    const newCycle: ClientSurveyCycle = {
      id: `cyc-${client.id}-${newYear}`,
      surveyId: null,
      name: mostRecent?.name ?? "DEI Survey",
      year: newYear,
      status: "onboarding",
      totalInvited: 0,
      submitted: 0,
      startDate: null,
      closeDate: null,
      keyDates: makeKeyDates({}),
      checklist: makeChecklist(["onboarding_email"], CURRENT_USER, { onboarding_email: TODAY_ISO }),
      onboarding: makeOnboarding(
        { questions: "in_progress", contacts: "not_started", finalization: "not_started" },
        {},
        { questions: TODAY_ISO }
      ),
    };

    setClient((prev) => ({ ...prev, status: "onboarding", surveys: [...prev.surveys, newCycle] }));
    pushToast(
      `Onboarding kicked off — invitation sent to ${client.primaryContactName} (${client.primaryContactEmail}) for the ${newYear} cycle.`,
      "success"
    );
    return newCycle.id;
  }

  function launchSurvey(cycleId: string) {
    const cycle = findCycle(cycleId);
    if (!cycle) return;
    const allDone = cycle.checklist.length > 0 && cycle.checklist.every((c) => c.done);
    if (!allDone) {
      pushToast("Complete the survey checklist before launching.", "warning");
      return;
    }
    setClient((prev) => ({
      ...prev,
      status: "survey_live",
      surveys: prev.surveys.map((s) => (s.id === cycleId ? { ...s, status: "live" } : s)),
    }));
    pushToast(`${cycle.name} '${String(cycle.year).slice(2)} is now live!`, "success");
  }

  return (
    <ClientCtx.Provider
      value={{
        client,
        activeCycle: getActiveCycle(client),
        toasts,
        dismissToast,
        toggleChecklistItem,
        updateKeyDates,
        setOnboardingStepStatus,
        requestOnboardingStepAction,
        sendFinalizationEmail,
        setClientStatus,
        setCycleStatus,
        startOnboarding,
        launchSurvey,
      }}
    >
      {children}
    </ClientCtx.Provider>
  );
}

export function useClientCtx(): ClientCtxValue {
  const ctx = useContext(ClientCtx);
  if (!ctx) throw new Error("useClientCtx must be used within a ClientProvider");
  return ctx;
}
