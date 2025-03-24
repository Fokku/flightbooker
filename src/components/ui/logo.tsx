
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ 
  className, 
  iconClassName,
  textClassName
}: LogoProps) {
  return (
    <Link 
      to="/" 
      className={cn(
        "flex items-center gap-2 font-medium", 
        className
      )}
    >
      <Plane 
        className={cn(
          "h-6 w-6 text-sky-600 transition-transform",
          iconClassName
        )} 
      />
      <span className={cn("text-xl font-semibold tracking-tight", textClassName)}>
        SkyGlobe
      </span>
    </Link>
  );
}
