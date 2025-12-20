import { Logo } from "@/components/branding/Logo";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 bg-surface">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          
          <p className="text-sm text-content-subtle">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
        
        {/* TODO: Add links when additional pages are created */}
        {/* TODO: Add social links and contact info */}
      </div>
    </footer>
  );
}
