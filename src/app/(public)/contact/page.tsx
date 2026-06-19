import React from "react";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";


export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-[1000px] font-sans">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-sans">
            We'd love to hear from you. Reach out to our team below.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 font-sans">
            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">location_on</i> Visit Our Office
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                <strong>AcehPost Headquarters</strong>
                <br />
                Jalan T. Nyak Arief No. 128
                <br />
                Lamnyong, Banda Aceh 23115
                <br />
                Aceh, Indonesia
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">email</i> General Inquiries
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-2">
                For general questions, news tips, or partnership opportunities:
              </p>
              <a href="mailto:info@acehpost.id" className="text-brand-green font-bold hover:underline">
                info@acehpost.id
              </a>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">phone</i> Call Us
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-2">Mon-Fri, 9am - 5pm WIB</p>
              <a
                href="tel:+62651778899"
                className="text-gray-900 dark:text-white font-bold hover:text-brand-green"
              >
                +62 (651) 778899
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 dark:bg-zinc-900 p-8 border-t-4 border-brand-green border border-gray-150 dark:border-zinc-800 rounded">
            <h3 className="text-xl font-bold uppercase mb-6 text-gray-900 dark:text-white">
              Send a Message
            </h3>
            <form className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
                  Subject
                </label>
                <select className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none">
                  <option>News Tip / Press Release</option>
                  <option>Advertising Inquiry</option>
                  <option>Website Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm h-32 focus:border-brand-green focus:outline-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button className="w-full bg-brand-green text-white font-bold uppercase py-3 hover:bg-brand-green-dark transition-colors cursor-pointer">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
