// components/ui/PremiumBadge.tsx
import { Trophy, Crown } from "lucide-react";

export default function PremiumBadge({ plan }: { plan: string | null | undefined }) {
  if (!plan) return null;

  if (plan === "MONTHLY") {
    return (
      <div className="flex items-center gap-1 ml-2">
        <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
        <span className="bg-linear-to-r from-yellow-500 to-orange-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
          VIP
        </span>
      </div>
    );
  }
  
  if (plan === "WEEKLY") {
    return <Crown className="w-4 h-4 text-orange-500 ml-2" />;
  }

  return null;
}
