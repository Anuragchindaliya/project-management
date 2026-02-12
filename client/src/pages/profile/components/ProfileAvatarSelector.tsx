import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProfileAvatarSelectorProps {
  currentAvatarUrl?: string;
  onSelect: (url: string) => void;
}

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Precious",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bandit",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Trouble",
];

export function ProfileAvatarSelector({
  currentAvatarUrl,
  onSelect,
}: ProfileAvatarSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {AVATAR_OPTIONS.map((url) => (
        <button
          key={url}
          type="button"
          onClick={() => onSelect(url)}
          className={cn(
            "relative rounded-full p-1 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
            currentAvatarUrl === url && "ring-2 ring-primary bg-primary/10"
          )}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={url} alt="Avatar option" />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
          {currentAvatarUrl === url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
              <Check className="h-6 w-6 text-white drop-shadow-md" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
