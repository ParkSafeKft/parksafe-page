import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata(
    "/privacy",
    "Adatvédelmi szabályzat – ParkSafe",
    "Ismerd meg, milyen adatokat kezel a ParkSafe, hogyan használjuk és védjük őket, és milyen jogok illetnek meg.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
