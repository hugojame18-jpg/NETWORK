import { Hero } from "@/components/marketing/hero";
import { TermsBar } from "@/components/marketing/terms-bar";
import { Offers } from "@/components/marketing/offers";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProductTour } from "@/components/marketing/product-tour";
import { Payouts } from "@/components/marketing/payouts";
import { Program } from "@/components/marketing/program";
import { Faq } from "@/components/marketing/faq";
import { SignupSplit } from "@/components/marketing/signup-split";

/**
 * The page of an affiliate network, in the order an affiliate reads one:
 * what it is and its terms, what there is to promote, how it works, how it is
 * tracked, how it pays, what more there is to earn — then the doubts, then
 * the door.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TermsBar />
      <Offers />
      <HowItWorks />
      <ProductTour />
      <Payouts />
      <Program />
      <Faq />
      <SignupSplit />
    </>
  );
}
