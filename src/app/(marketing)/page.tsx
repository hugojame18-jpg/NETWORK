import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProductTour } from "@/components/marketing/product-tour";
import { Verticals } from "@/components/marketing/verticals";
import { Referral } from "@/components/marketing/referral";
import { Faq } from "@/components/marketing/faq";
import { SignupSplit } from "@/components/marketing/signup-split";

/**
 * The order follows the questions a visitor asks: what is this, how does it
 * work, why you, what exactly am I promoting, what else is in it for me —
 * then the doubts, then the door.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ProductTour />
      <Verticals />
      <Referral />
      <Faq />
      <SignupSplit />
    </>
  );
}
