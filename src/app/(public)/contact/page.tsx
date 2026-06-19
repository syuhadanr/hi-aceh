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
  const [subject, setSubject] = useState("Tips Berita / Siaran Pers");
  const [message, setMessage] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

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
    setStatusType(null);
    if (!name || !email || !subject || !message) {
      setStatusMsg("Mohon isi semua bidang yang diperlukan.");
      setStatusType("error");
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
        setStatusMsg("Pesan berhasil dikirim. Terima kasih sudah menghubungi kami!");
        setStatusType("success");
        setName("");
        setEmail("");
        setAddress("");
        setSubject("Tips Berita / Siaran Pers");
        setMessage("");
        setCaptchaInput("");
        await refreshCaptcha();
      } else {
        setStatusMsg(data.error || "Gagal mengirim pesan. Silakan coba lagi.");
        setStatusType("error");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setStatusType("error");
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-green focus:outline-none transition-colors";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5";

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      {/* Page Header */}
      <div className="border-b border-gray-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-[1100px] py-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-green mb-2">Redaksi Hi Aceh</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase text-gray-900 dark:text-white mb-4">
            {pageData?.title || "Hubungi Kami"}
          </h1>
          {pageData?.description ? (
            <div
              className="text-gray-500 dark:text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed"
            >
              {pageData.description}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
              Punya tips berita, informasi penting, atau ingin berkolaborasi? Kami siap mendengar. 
              Gunakan formulir di bawah atau hubungi kami langsung melalui saluran yang tersedia.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-grow max-w-[1100px]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Contact Info — 2 cols */}
          <div className="md:col-span-2 space-y-8">

            <div className="border-l-2 border-brand-green pl-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="material-icons text-brand-green text-base">location_on</i>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Kantor Redaksi</h3>
              </div>
              <p className="text-gray-900 dark:text-white font-bold text-sm mb-0.5">{settings?.siteName || 'Hi Aceh'}</p>
              <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
                {settings?.address || 'Banda Aceh, Aceh, Indonesia'}
              </p>
            </div>

            <div className="border-l-2 border-brand-green pl-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="material-icons text-brand-green text-base">email</i>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Surel Redaksi</h3>
              </div>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-2">
                Untuk pertanyaan umum, tips berita, siaran pers, dan peluang kemitraan:
              </p>
              <a
                href={`mailto:${settings?.contactEmail || '#'}`}
                className="text-brand-green font-bold text-sm hover:underline break-all"
              >
                {settings?.contactEmail || 'Surel belum dikonfigurasi'}
              </a>
            </div>

            <div className="border-l-2 border-brand-green pl-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="material-icons text-brand-green text-base">phone</i>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Telepon</h3>
              </div>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-2">Senin – Jumat, 08.00 – 17.00 WIB</p>
              {settings?.phoneNumber ? (
                <a
                  href={`tel:${settings.phoneNumber}`}
                  className="text-gray-900 dark:text-white font-bold text-sm hover:text-brand-green transition-colors block"
                >
                  {settings.phoneNumber}
                </a>
              ) : (
                <span className="text-gray-400 dark:text-zinc-500 text-sm">Nomor belum dikonfigurasi</span>
              )}
              {settings?.faxNumber && (
                <p className="text-gray-500 dark:text-zinc-500 text-xs mt-1">Faks: {settings.faxNumber}</p>
              )}
            </div>

            <div className="border-l-2 border-gray-200 dark:border-zinc-700 pl-5">
              {pageData?.catatan_redaksi ? (
                <div
                  className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed prose prose-invert max-w-none
                    prose-p:text-xs prose-p:text-gray-600 prose-p:dark:text-zinc-400 prose-p:my-1
                    prose-strong:font-bold prose-strong:text-gray-700 prose-strong:dark:text-zinc-300
                    prose-a:text-brand-green prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: pageData.catatan_redaksi }}
                />
              ) : (
                <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
                  <span className="font-bold text-gray-600 dark:text-zinc-300 block mb-1">Catatan Redaksi</span>
                  Hi Aceh berkomitmen pada jurnalisme yang cermat dan bertanggung jawab. 
                  Setiap informasi yang masuk akan ditindaklanjuti sesuai standar editorial kami.
                </p>
              )}
            </div>
          </div>

          {/* Contact Form — 3 cols */}
          <div className="md:col-span-3">
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 border-t-4 border-t-brand-green p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6">
                Kirim Pesan
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nama Lengkap <span className="text-brand-green">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Nama Anda"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alamat Surel <span className="text-brand-green">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="contoh@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Asal Kota / Instansi</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className={inputClass}
                    placeholder="Misal: Banda Aceh / Universitas Syiah Kuala"
                  />
                </div>

                <div>
                  <label className={labelClass}>Perihal <span className="text-brand-green">*</span></label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className={inputClass}
                    placeholder="Topik pesan Anda"
                  />
                </div>

                <div>
                  <label className={labelClass}>Pesan <span className="text-brand-green">*</span></label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Tuliskan pesan, informasi, atau pertanyaan Anda di sini..."
                  />
                </div>

                {/* Captcha row */}
                <div>
                  <label className={labelClass}>Kode Verifikasi <span className="text-brand-green">*</span></label>
                  <div className="flex items-stretch gap-3">
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder="Masukkan kode di samping"
                    />
                    <div className="flex items-center justify-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-3 min-w-[100px]">
                      <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                    </div>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-brand-green transition-colors whitespace-nowrap"
                    >
                      Ganti
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="w-full bg-brand-green text-white font-bold uppercase tracking-wider text-sm py-3.5 hover:bg-brand-green-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </div>

                {statusMsg && (
                  <div className={`text-sm text-center py-2 px-3 ${
                    statusType === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}>
                    {statusMsg}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}