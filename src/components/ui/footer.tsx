import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  // MailIcon,
  // PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExternalLink } from "@/components/ui/external-link";
import { MobileFooterAccordion } from "@/components/feature/mobile-footer-accordion";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/haafiz_perfumes_branding.png"
              alt="Haafiz Perfumes"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <p className="text-muted-foreground">
              Premium perfumes and authentic attars crafted with the finest
              ingredients from around the world.
            </p>
            <div className="flex space-x-4">
              <ExternalLink href="https://www.instagram.com/haafiz_perfumes.in/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <InstagramIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
              <ExternalLink href="https://www.facebook.com/haafiz.perfumes/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <FacebookIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
              <ExternalLink href="https://wa.me/919601800822">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  {/* <Image
                    src="/whatsapp-icon.svg"
                    alt="WhatsApp"
                    width={16}
                    height={16}
                  /> */}
                  <WhatsAppIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Quick Links
            </h4>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/collections/perfumes"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Premium Perfumes
              </Link>
              <Link
                href="/collections/attars"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Authentic Attars
              </Link>
              {/* <Link
                href="/collections/combos"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Combo Offers
              </Link> */}
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Customer Care
            </h4>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/shipping"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Shipping Info
              </Link>
              <Link
                href="/returns"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Returns & Exchanges
              </Link>
              <Link
                href="/faq"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">
              Contact Info
            </h4>
            <div className="space-y-3">
              {/* <div className="flex items-center space-x-3 text-muted-foreground">
                <MailIcon className="h-5 w-5 text-primary" />
                <span>hello@haafizperfumes.com</span>
              </div> */}
              <div className="flex items-center space-x-3 text-muted-foreground">
                <WhatsAppIcon className="h-5 w-5 text-primary" />
                <span>+91 96018 00822 (WhatsApp)</span>
              </div>
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPinIcon className="h-5 w-5 text-primary mt-1" />
                <span>
                  Muglisara
                  <br />
                  Surat, India 395003
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8">
          {/* Centered Brand Section */}
          <div className="text-center space-y-4">
            <Image
              src="/haafiz_perfumes_branding.png"
              alt="Haafiz Perfumes"
              width={120}
              height={40}
              className="h-10 w-auto object-contain mx-auto"
              priority
            />
            <p className="text-muted-foreground">
              Premium perfumes and authentic attars crafted with the finest
              ingredients from around the world.
            </p>
            <div className="flex justify-center space-x-4">
              <ExternalLink href="https://www.instagram.com/haafiz_perfumes.in/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <InstagramIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
              <ExternalLink href="https://www.facebook.com/haafiz.perfumes/">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <FacebookIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
              <ExternalLink href="https://wa.me/919601800822">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <WhatsAppIcon className="h-5 w-5" />
                </Button>
              </ExternalLink>
            </div>
          </div>

          {/* Mobile Accordion */}
          <MobileFooterAccordion />
        </div>

        <div className="border-t border-border md:mt-4 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 Haafiz Perfumes. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
