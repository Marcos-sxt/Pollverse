
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PollVerse. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Ethereum blockchain
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
