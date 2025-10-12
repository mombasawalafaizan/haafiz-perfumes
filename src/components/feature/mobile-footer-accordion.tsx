"use client";

import Link from "next/link";
import {
  // MailIcon,
  // PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function MobileFooterAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="quick-links">
        <AccordionTrigger className="text-lg font-semibold text-foreground">
          Quick Links
        </AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="customer-care">
        <AccordionTrigger className="text-lg font-semibold text-foreground">
          Customer Care
        </AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="contact-info">
        <AccordionTrigger className="text-lg font-semibold text-foreground">
          Contact Info
        </AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
