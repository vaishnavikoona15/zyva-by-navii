"use client";

import { Plane } from "lucide-react";
import { useState } from "react";

import BudgetBreakdownCards from "@/components/BudgetBreakdownCards";
import EmptyState from "@/components/EmptyState";
import ItineraryDay from "@/components/ItineraryDay";
import TravelForm, { type TravelFormValues } from "@/components/TravelForm";
import TypingIndicator from "@/components/TypingIndicator";
import { API_URL, postJSON } from "@/lib/api";
import type { TravelPlanResponse } from "@/lib/types";

const DEFAULT_FORM: TravelFormValues = {
  destination: "",
  durationDays: "3",
  budget: "",
  travelStyle: "mid-range",
  interests: [],
};

export default function TravelPanel({ userId }: { userId: string | null }) {
  const [form, setForm] = useState<TravelFormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<TravelPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!userId || !form.destination.trim() || !form.budget || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await postJSON<TravelPlanResponse>("/travel/plan", {
        user_id: userId,
        destination: form.destination.trim(),
        duration_days: Number(form.durationDays) || 3,
        budget: Number(form.budget) || 0,
        currency: "INR",
        travel_style: form.travelStyle,
        interests: form.interests,
      });
      setResult(data);
    } catch {
      setError(`Couldn't reach the Zyva backend at ${API_URL}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
        {!result && !loading && !error && (
          <EmptyState
            icon={Plane}
            title="Fill in your trip details below and Zyva will plan it."
            subtitle="Budget breakdown + a day-by-day itinerary, tailored to your style."
          />
        )}
        {loading && <TypingIndicator />}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {result && (
          <>
            <BudgetBreakdownCards breakdown={result.budget_breakdown} />
            <div className="space-y-4">
              {result.itinerary.map((day) => (
                <ItineraryDay key={day.day} day={day} />
              ))}
            </div>
          </>
        )}
      </div>
      <TravelForm values={form} onChange={setForm} onSubmit={handleSubmit} disabled={loading} />
    </>
  );
}
