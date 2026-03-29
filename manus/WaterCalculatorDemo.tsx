"use client";

import React from "react";
import WaterCalculatorQuiz from "./WaterCalculatorQuiz";
import { Droplet, Truck, Award, Clock } from "lucide-react";

/**
 * WaterCalculatorDemo
 * 
 * A demonstration page showcasing the WaterCalculatorQuiz component.
 * Includes:
 * - Header with branding
 * - Hero section explaining the quiz
 * - The quiz component itself
 * - Trust badges and features
 * - Footer
 */

export default function WaterCalculatorDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      {/* ====================================================================
          HEADER / NAVIGATION
          ==================================================================== */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-[#005A9C]" />
            <h1 className="font-montserrat text-2xl font-bold text-[#333333]">
              HaulAgua
            </h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#" className="font-lato text-gray-700 hover:text-[#005A9C] transition-colors">
              For Customers
            </a>
            <a href="#" className="font-lato text-gray-700 hover:text-[#005A9C] transition-colors">
              For Haulers
            </a>
            <a href="#" className="font-lato text-gray-700 hover:text-[#005A9C] transition-colors">
              About
            </a>
          </nav>
        </div>
      </header>

      {/* ====================================================================
          HERO SECTION
          ==================================================================== */}
      <section className="bg-gradient-to-r from-[#005A9C] to-[#004a80] text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-montserrat text-4xl md:text-5xl font-bold mb-6">
            How Much Water Do You Need?
          </h2>
          <p className="font-lato text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Answer a few quick questions and we'll estimate your water needs, then connect you with trusted local haulers in your area.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5" />
              <span>Takes 2 minutes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Award className="w-5 h-5" />
              <span>Free estimates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Truck className="w-5 h-5" />
              <span>Verified haulers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          QUIZ SECTION
          ==================================================================== */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <WaterCalculatorQuiz />
        </div>
      </section>

      {/* ====================================================================
          FEATURES SECTION
          ==================================================================== */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-12">
            Why Choose HaulAgua?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#005A9C]/10 rounded-full flex items-center justify-center">
                  <Droplet className="w-8 h-8 text-[#005A9C]" />
                </div>
              </div>
              <h4 className="font-montserrat text-xl font-bold text-[#333333] mb-2">
                Accurate Estimates
              </h4>
              <p className="font-lato text-gray-600">
                Our smart quiz calculates your exact water needs based on your specific project type and size.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#F2A900]/10 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-[#F2A900]" />
                </div>
              </div>
              <h4 className="font-montserrat text-xl font-bold text-[#333333] mb-2">
                Local Haulers
              </h4>
              <p className="font-lato text-gray-600">
                Get connected with verified, professional water haulers in your area who can meet your needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#005A9C]/10 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#005A9C]" />
                </div>
              </div>
              <h4 className="font-montserrat text-xl font-bold text-[#333333] mb-2">
                Trusted Service
              </h4>
              <p className="font-lato text-gray-600">
                All haulers on our platform are verified and reviewed by real customers like you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          USE CASES SECTION
          ==================================================================== */}
      <section className="py-16 md:py-24 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-12">
            We Serve All Your Water Needs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏊", title: "Swimming Pools", desc: "New fills and top-offs for residential and commercial pools" },
              { icon: "🏗️", title: "Construction", desc: "Dust control and hydration for job sites of any size" },
              { icon: "🚰", title: "Cisterns & Tanks", desc: "Drinking water delivery for homes and businesses" },
              { icon: "🌾", title: "Agriculture", desc: "Livestock watering and crop irrigation solutions" },
              { icon: "🚨", title: "Emergency", desc: "Fast response for dry wells and emergency situations" },
              { icon: "🎪", title: "Events", desc: "Water supply for festivals, sporting events, and more" },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="text-4xl mb-3 block">{useCase.icon}</span>
                <h4 className="font-montserrat font-bold text-lg text-[#333333] mb-2">
                  {useCase.title}
                </h4>
                <p className="font-lato text-gray-600 text-sm">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          TESTIMONIALS SECTION
          ==================================================================== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="font-montserrat text-3xl font-bold text-center text-[#333333] mb-12">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Pool Owner",
                text: "HaulAgua made it so easy to find a reliable water hauler. The quiz was quick and the estimates were spot-on!",
                rating: 5,
              },
              {
                name: "John D.",
                role: "Construction Manager",
                text: "We use HaulAgua for all our job sites. The service is consistent and the pricing is fair. Highly recommended.",
                rating: 5,
              },
              {
                name: "Maria L.",
                role: "Farm Owner",
                text: "Finally, a directory that understands agricultural water needs. The haulers here know their stuff.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-[#F8F9FA] p-6 rounded-lg border border-gray-200"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-[#F2A900]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-lato text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-montserrat font-bold text-[#333333]">
                    {testimonial.name}
                  </p>
                  <p className="font-lato text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          CTA SECTION
          ==================================================================== */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#005A9C] to-[#004a80] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="font-montserrat text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Water Hauler?
          </h3>
          <p className="font-lato text-lg text-blue-100 mb-8">
            Start the quiz above to get your personalized estimate and connect with trusted haulers in your area.
          </p>
          <button className="bg-[#F2A900] text-[#333333] font-montserrat font-bold py-4 px-8 rounded-lg hover:bg-[#e09900] transition-colors text-lg">
            Start the Quiz
          </button>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="bg-[#333333] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-6 h-6 text-[#F2A900]" />
                <h5 className="font-montserrat font-bold text-lg">HaulAgua</h5>
              </div>
              <p className="font-lato text-gray-400 text-sm">
                Connecting customers with trusted water haulers.
              </p>
            </div>
            <div>
              <h6 className="font-montserrat font-bold text-white mb-4">
                For Customers
              </h6>
              <ul className="space-y-2 font-lato text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Find Haulers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-montserrat font-bold text-white mb-4">
                For Haulers
              </h6>
              <ul className="space-y-2 font-lato text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    List Your Business
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing Plans
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-montserrat font-bold text-white mb-4">
                Company
              </h6>
              <ul className="space-y-2 font-lato text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="font-lato text-gray-400 text-sm text-center">
              © 2024 HaulAgua. All rights reserved. | Connecting communities with clean water.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
