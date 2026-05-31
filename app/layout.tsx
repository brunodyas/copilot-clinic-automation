import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "@/components/dashboard/ToasterProvider";
// Category
// Static layout shell, reused by all routes.
// Why
// app/layout.tsx defines static metadata and renders the shared HTML/body structure.
// It also includes ToasterProvider, which is a Client Component wrapper around a dynamically imported toaster.
// ToasterProvider disables SSR for the actual toaster component with { ssr: false }, so the toaster UI is browser-only.
export const metadata: Metadata = {
	title: "Offline GraphQL Analytics Dashboard",
	description: "Production-ready GraphQL portfolio project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body>
				{children}
				<ToasterProvider />
			</body>
		</html>
	);
}
