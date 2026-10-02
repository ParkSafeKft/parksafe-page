import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata(
    "/terms",
    "Általános szerződési feltételek – ParkSafe",
    "A ParkSafe alkalmazás és szolgáltatások használati feltételei, a felhasználók jogai és kötelezettségei.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
