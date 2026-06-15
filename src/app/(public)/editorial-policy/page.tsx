import React from "react";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";

export default function EditorialPolicyPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-[800px] font-sans">
        <header className="mb-12 border-b border-gray-200 dark:border-zinc-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase text-gray-900 dark:text-white mb-2">
            Editorial Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 font-sans uppercase tracking-widest">
            Last Updated: January 1, 2024
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700 dark:text-zinc-300 font-sans leading-relaxed space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              1. Commitment to Truth and Accuracy
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              At AcehPost, our primary loyalty is to the citizens of Aceh. We strive to provide news that is comprehensive, proportional, and accurate. All facts are verified before publication. When we make a mistake, we correct it promptly and transparently.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              2. Independence and Integrity
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              We maintain strict independence from political parties, corporate interests, and religious institutions. Our editorial decisions are made solely by our editors based on newsworthiness and public interest. We do not accept payment for news coverage.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              3. Fairness and Right of Reply
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              We believe in fair play. Individuals or organizations that are the subject of critical reporting are given a reasonable opportunity to respond before publication. We avoid sensationalism and respect the presumption of innocence in legal matters.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              4. Protection of Sources
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              We protect the identity of confidential sources who provide information in the public interest, in accordance with Indonesian Press Law (UU Pers No. 40/1999). However, we strive to use on-the-record sources whenever possible to maximize transparency.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              5. Hate Speech and Discrimination
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              AcehPost strictly prohibits any content that incites hatred or violence based on race, ethnicity, religion, gender, or sexual orientation. We are committed to fostering a respectful public discourse.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
