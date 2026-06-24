export type ConfidenceColor = { bar: string; text: string; ring: string };

export function getConfidenceColor(value: number): ConfidenceColor {
  if (value < 0.4) return { bar: "bg-red-500", text: "text-red-300", ring: "ring-red-500/30" };
  if (value <= 0.7) return { bar: "bg-yellow-500", text: "text-yellow-300", ring: "ring-yellow-500/30" };
  return { bar: "bg-green-500", text: "text-green-300", ring: "ring-green-500/30" };
}
