
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 500,
  direction = "up",
  className,
  once = true,
  ...props
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [once]);

  const directionStyles = () => {
    switch (direction) {
      case "up":
        return "translate-y-8";
      case "down":
        return "-translate-y-8";
      case "left":
        return "translate-x-8";
      case "right":
        return "-translate-x-8";
      default:
        return "";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translate3d(0, 0, 0)"
          : `translate3d(${direction === "left" ? "10px" : direction === "right" ? "-10px" : "0"}, ${
              direction === "up" ? "10px" : direction === "down" ? "-10px" : "0"
            }, 0)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
