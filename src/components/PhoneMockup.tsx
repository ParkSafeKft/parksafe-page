import Image from "next/image";

export default function PhoneMockup({ className = "", priority = false, alt = "" }: {
    className?: string;
    priority?: boolean;
    alt?: string;
}) {
    return (
        <div className={`relative aspect-[600/1300] overflow-hidden ${className}`}>
            <Image
                src="/parksafe-phone-mockup.png"
                alt={alt}
                width={1920}
                height={1440}
                sizes="(min-width: 1024px) 1280px, (min-width: 640px) 1216px, 992px"
                priority={priority}
                style={{ clipPath: "inset(11% 35.9% 11% 36.2% round 2.3%)" }}
                className="absolute -left-[110%] -top-[10%] h-auto w-[320%] max-w-none"
            />
        </div>
    );
}
