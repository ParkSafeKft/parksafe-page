import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AccountAccessLayoutProps = {
    backHref: string;
    backLabel: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
};

export function AccountAccessLayout({
    backHref,
    backLabel,
    eyebrow,
    title,
    subtitle,
    children,
}: AccountAccessLayoutProps) {
    return (
        <section className="flex min-h-screen items-center bg-white px-5 py-28 selection:bg-[#34aa56] selection:text-white sm:px-8 lg:px-12 lg:py-36">
            <div className="mx-auto grid w-full max-w-[1440px] gap-14 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6a62] transition-colors hover:text-[#101512] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>

                    <div className="mt-14 max-w-xl lg:mt-24">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">
                            {eyebrow}
                        </p>
                        <h1 className="mt-6 text-5xl font-black leading-[0.92] tracking-[-0.055em] text-[#101512] text-balance sm:text-6xl lg:text-7xl">
                            {title}
                        </h1>
                        <p className="mt-7 max-w-md text-lg leading-8 text-[#626e66] text-pretty">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="border-t border-[#101512]/20 pt-10 lg:col-span-6 lg:col-start-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-16">
                    <div className="w-full max-w-md">{children}</div>
                </div>
            </div>
        </section>
    );
}
