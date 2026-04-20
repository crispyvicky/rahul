import { Metadata } from 'next';
import "../index.css";
import "../App.scss";
import "../variables.scss";
import Header from "../components/header";
import Footer from "../components/footer";
import ScrollToHash from "../components/scroll";
import Cursor from "../components/Cursor";

export const metadata: Metadata = {
    title: 'RahulFitzz | Elite Fitness Influencer & Brand Partner',
    description: 'Transform your brand and physique with RahulFitzz. 165K+ combined reach, high-impact content strategy, and world-class fitness coaching.',
    keywords: 'RahulFitzz, Fitness Influencer, Brand Collaborations, Muscle Growth, Discipline, Gym Influencer Portfolio',
    openGraph: {
        title: 'RahulFitzz | Elite Fitness Portfolio',
        description: 'Engineered for those who refuse average. Discover the evolution edge.',
        url: 'https://rahulfitzz.com',
        siteName: 'RahulFitzz',
        images: [
            {
                url: 'https://rahulfitzz.com/icon.png',
                width: 512,
                height: 512,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RahulFitzz | Fitness Performance',
        description: 'Transform your brand and physique with 165K+ elite reach.',
        images: ['https://rahulfitzz.com/icon.png'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
                <style>{`
                    @media (min-width: 768px) {
                        body { cursor: none !important; }
                        a, button, select, input, textarea { cursor: none !important; }
                    }
                `}</style>
            </head>
            <body suppressHydrationWarning>
                <Cursor />
                <div className="main-container">
                    <ScrollToHash />
                    <Header />
                    {children}
                    <Footer />
                </div>
            </body>
        </html>
    );
}
