interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div
      className="w-full skeleton rounded-md"
      style={{ height }}
      role="status"
      aria-label="Chargement du graphique…"
    />
  );
}
