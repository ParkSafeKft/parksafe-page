import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata(
    "/contact",
    "Kapcsolat – ParkSafe",
    "Kérdésed van a ParkSafe-ről, vagy együttműködnél velünk? Itt találod az elérhetőségeinket.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
