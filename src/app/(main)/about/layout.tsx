import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata(
    "/about",
    "Rólunk – ParkSafe",
    "Ismerd meg a ParkSafe történetét, csapatát és a kerékpáros közlekedést segítő alkalmazás fejlődését.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
