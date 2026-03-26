import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatValue } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | null;
  unit: string;
  trend?: number | null; // percentage change
  description?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  unit,
  trend,
  description,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="skeleton h-4 w-32 mb-3" />
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-3 w-48" />
      </div>
    );
  }

  const TrendIcon =
    trend == null ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    trend == null
      ? "text-gray-400"
      : trend > 0
      ? "text-green-600"
      : "text-red-600";

  return (
    <div className="bg-white rounded-lg border border-dsfr-grey-border p-5 hover:shadow-sm transition-shadow">
      <p className="text-xs font-medium text-dsfr-grey uppercase tracking-wide mb-1">
        {title}
      </p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-bold text-gray-900">
          {value !== null ? formatValue(value, "") : "—"}
        </span>
        <span className="text-sm text-gray-500 mb-1">{unit}</span>
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span>
            {trend !== null
              ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)} % vs période préc.`
              : "Pas de variation calculable"}
          </span>
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
}
