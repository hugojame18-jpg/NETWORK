import { Hero } from "@/components/marketing/hero";
import { WhyUs } from "@/components/marketing/why-us";
import { Verticals } from "@/components/marketing/verticals";
import { SignupSplit } from "@/components/marketing/signup-split";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyUs />
      <Verticals />
      <SignupSplit />
    </>
  );
}
