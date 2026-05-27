import Link from "next/link";
import {
  Activity,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg shadow-[var(--primary)]/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">TransitFlow</p>
                <p className="text-sm text-muted-foreground">
                  Smart Transit Management
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time transit monitoring platform for operators and
              administrators with fleet tracking, RFID management, and
              analytics.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://facebook.com"
                className="transition-transform duration-200 hover:scale-110"
              >
                <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link
                href="https://twitter.com"
                className="transition-transform duration-200 hover:scale-110"
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link
                href="https://instagram.com"
                className="transition-transform duration-200 hover:scale-110"
              >
                <Send className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold">Platform</p>
            <div className="space-y-2">
              <Link
                href="/overview"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/book-trip"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Book a Trip
              </Link>
              <Link
                href="/my-trips"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                My Trips
              </Link>
              <Link
                href="/system-monitoring"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                System Monitoring
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold">Operations</p>
            <div className="space-y-2">
              <Link
                href="/live-transit-map"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Live Transit Map
              </Link>
              <Link
                href="/rfid-management"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                RFID Management
              </Link>
              <Link
                href="/dashboard"
                className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold">Contact</p>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+251 911 222 333</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@transitflow.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 TransitFlow</span>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              href="/privacy"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/contact"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
