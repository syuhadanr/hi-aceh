"use client";

import React, { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";


export const dynamic = "force-dynamic";

export default function ContactPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("News Tip / Press Release");
  const [message, setMessage] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch("/api/pages/contact", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setPageData(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };

    const fetchCaptcha = async () => {
      try {
        const res = await fetch("/api/contact/captcha");
        if (res.ok) {
          const data = await res.json();
          setCaptchaSvg(data.svg || "");
          setCaptchaToken(data.token || "");
        }
      } catch (e) {
        console.error("Failed to load captcha", e);
      }
    };

    fetchPage();
    fetchSettings();
    fetchCaptcha();
  }, []);

  const refreshCaptcha = async () => {
    try {
      const res = await fetch("/api/contact/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg || "");
        setCaptchaToken(data.token || "");
        setCaptchaInput("");
      }
    } catch (e) {
      console.error("Failed to refresh captcha", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!name || !email || !subject || !message) {
      setStatusMsg("Mohon isi semua bidang yang diperlukan.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, address, subject, message, captcha: captchaInput, captchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg("Pesan berhasil dikirim. Terima kasih!");
        setName("");
        setEmail("");
        setAddress("");
        setSubject("News Tip / Press Release");
        setMessage("");
        setCaptchaInput("");
        await refreshCaptcha();
      } else {
        setStatusMsg(data.error || "Gagal mengirim pesan.");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg("Kesalahan jaringan saat mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-[1000px] font-sans">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase text-gray-900 dark:text-white mb-4">
            {pageData?.title || "Contact Us"}
          </h1>
          {pageData?.content ? (
            <div className="text-gray-500 dark:text-zinc-400 font-sans" dangerouslySetInnerHTML={{ __html: pageData.content }} />
          ) : (
            <p className="text-gray-500 dark:text-zinc-400 font-sans">We'd love to hear from you. Reach out to our team below.</p>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 font-sans">
            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">location_on</i> Visit Our Office
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                <strong>{settings?.siteName || 'Headquarters'}</strong>
                <br />
                {settings?.address || 'Address not set'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">email</i> General Inquiries
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-2">For general questions, news tips, or partnership opportunities:</p>
              <a href={`mailto:${settings?.contactEmail || '#'}`} className="text-brand-green font-bold hover:underline">{settings?.contactEmail || 'Contact email not set'}</a>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <i className="material-icons text-brand-green">phone</i> Call Us
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-2">Available during business hours</p>
              {settings?.phoneNumber && (
                <a href={`tel:${settings.phoneNumber}`} className="text-gray-900 dark:text-white font-bold hover:text-brand-green block mb-2">{settings.phoneNumber}</a>
              )}
              {settings?.faxNumber && (
                <div className="text-gray-600 dark:text-zinc-400 text-sm">Fax: {settings.faxNumber}</div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 dark:bg-zinc-900 p-8 border-t-4 border-brand-green border border-gray-150 dark:border-zinc-800 rounded">
            <h3 className="text-xl font-bold uppercase mb-6 text-gray-900 dark:text-white">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Nama*</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none" placeholder="Nama Anda" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Email*</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none" placeholder="Email Anda" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Alamat*</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none" placeholder="Tempat tinggal" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Perihal*</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none" placeholder="Perihal" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Pesan/Pertanyaan*</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm h-32 focus:border-brand-green focus:outline-none" placeholder="Ketik di sini..." required />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">Kode*</label>
                  <input type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:border-brand-green focus:outline-none" placeholder="Validasi" required />
                </div>
                <div className="w-40 h-12 flex items-center justify-center bg-white/5 rounded border border-zinc-800 p-2">
                  <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                </div>
                <button type="button" onClick={refreshCaptcha} className="text-sm text-gray-400 hover:text-white">Refresh</button>
              </div>

              <div>
                <button disabled={sending} className="w-full bg-brand-green text-white font-bold uppercase py-3 hover:bg-brand-green-dark transition-colors cursor-pointer">{sending ? 'Mengirim...' : 'Send Message'}</button>
              </div>
              {statusMsg && <div className="text-sm text-center text-zinc-300">{statusMsg}</div>}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
