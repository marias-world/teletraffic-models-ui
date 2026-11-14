import { formatDuration } from "@/lib/timing";

type Props = {
  ms: number | null;
};

export default function ComputationTime({ ms }: Props) {
  if (ms === null) return null;
  return (
    <p className="text-xs text-slate-400">
      Computation time: <span className="font-mono">{formatDuration(ms)}</span>
    </p>
  );
}
