"use client";

import "../index.css";
import "../App.scss";
import "../variables.scss";
import Header from "../components/header";
import Footer from "../components/footer";
import ScrollToHash from "../components/scroll";
import Cursor from "../components/Cursor";

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
