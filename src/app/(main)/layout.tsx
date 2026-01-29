import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="app flex flex-col min-h-screen">
            <Header />
            <main className="main-content flex-1 flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
}
