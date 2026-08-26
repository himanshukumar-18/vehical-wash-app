"use client";

import PromotionalBanner from "../../components/sections/PromotionalBanner";
import Hero from "../../components/sections/Hero";
import Model from "../../components/sections/Model";
import Services from "../../components/sections/Services";
import About from "../../components/sections/About";
import WhyChooseScroll from "../../components/layouts/WhyChooseScroll";
import Work from "../../components/sections/Work";
import WhyChoose from "../../components/sections/WhyChoose";
import Pricing from "../../components/sections/Pricing";
import Features from "../../components/sections/Features";
import Testimonials from "../../components/sections/Testimonials";
import Fq from "../../components/sections/Fq";
import Contact from "../../components/sections/Contact";

export default function HomePage() {
  return (
    <main>
      <PromotionalBanner />
      <Hero />
      <Services />
      <Model />
      <About />
      <Work />
      <WhyChooseScroll />
      <WhyChoose />
      <Pricing />
      <Features />
      <Testimonials />
      <Fq />
      <Contact />
    </main>
  );
}