import { useRef } from "react";
import { cn } from "@/lib/utils";

interface HeroBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: React.ReactNode;
}

export const HeroBackground = ({
    className,
    children,
    ...props
}: HeroBackgroundProps) => {
    return (
        <div
            className={cn(
                "relative w-full min-h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 overflow-hidden isolate",
                className
            )}
            {...props}
        >
            {/* Lively Gradient Orbs - Subtle & Professional */}
            {/* Top Right - ParkSafe Green */}
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-[#34aa56]/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

            {/* Bottom Left - Tech Teal */}
            <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-teal-400/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

            {/* Subtle Grid Pattern - Professional Tech Vibe */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

            {/* Optional: Very subtle top glow to give depth without being a 'blob' */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#34aa56]/5 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center">
                {children}
            </div>
        </div>
    );
};
