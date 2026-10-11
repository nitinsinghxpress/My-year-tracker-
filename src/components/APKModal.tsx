import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, ExternalLink, Copy, Check, ShieldCheck, Zap, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface APKModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const APKModal: React.FC<APKModalProps> = ({ isOpen, onClose, language }) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'pwabuilder' | 'cli'>('install');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwabuilderUrl = `https://www.pwabuilder.com/?site=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res === 'accepted') {
        onClose();
      }
    }
  };

  const isHindi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isHindi ? 'Android APK / App Install' : 'Android APK & Installation'}
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  WebAPK / PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isHindi ? 'Apne Android phone par install ya download karein' : 'Install on Android device or generate standalone APK'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isHindi ? '1-Tap Direct Install' : '1-Tap Android Install'}
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pwabuilder'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {isHindi ? 'Raw APK File' : 'Download .APK'}
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isHindi ? 'Info & Details' : 'Package Specs'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'install' && (
            <div className="space-y-4">
              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      {isHindi ? 'App already installed hai!' : 'App is already installed!'}
                    </p>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      {isHindi 
                        ? 'Yeh app aapke phone ke app drawer aur home screen par available hai. Yeh offline bhi kaam karta hai.'
                        : 'Year Tracker is currently running in standalone app mode on your device with full offline storage.'}
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                      <Zap className="w-4 h-4" />
                      {isHindi ? 'Instant WebAPK Ready' : 'Instant WebAPK Ready'}
                    </div>
                    <p className="text-xs text-slate-300">
                      {isHindi 
                        ? 'Neeche diye button par click karein. Android Chrome seedha ek authentic native APK install kar dega (WebAPK).'
                        : 'Tap the button below. Android Chrome automatically generates and installs a signed native WebAPK into your system app drawer.'}
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {isHindi ? 'Abhi Android par Install Karein' : 'Install to Android Now'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      {isHindi ? 'Android Browser se Install karne ka Tarika' : 'How to install on Android Chrome'}
                    </h3>
                    <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1">
                      <li>
                        {isHindi 
                          ? 'Phone ke Chrome browser me top-right ke 3-dots (⋮) par tap karein.'
                          : 'Open Chrome on your Android device and tap the 3 dots (⋮) in the top-right.'}
                      </li>
                      <li>
                        {isHindi 
                          ? 'Menu me "Install app" ya "Add to Home screen" par tap karein.'
                          : 'Select "Install app" or "Add to Home screen".'}
                      </li>
                      <li>
                        {isHindi 
                          ? '"Install" par confirm karein — Android turant icon create kar dega!'
                          : 'Confirm "Install" — Android will automatically compile the WebAPK with full offline support.'}
                      </li>
                    </ol>
                  </div>

                  {isIOS && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <p className="font-bold text-white">Apple iOS / iPhone Instructions:</p>
                      <p>Safari browser me bottom Share icon tap karein, phir &quot;Add to Home Screen&quot; chunein.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Share link box */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {isHindi ? 'Apne Mobile Phone me yeh link open karein:' : 'Open this app link directly on your Android phone:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? (isHindi ? 'Copied' : 'Copied') : (isHindi ? 'Copy' : 'Copy')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Download className="w-4 h-4" />
                  {isHindi ? 'PWABuilder se Standalone .APK File Download' : 'Generate Standalone .APK via PWABuilder'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHindi
                    ? 'PWABuilder Microsoft ka open-source tool hai jo kisi bhi valid PWA se real Android APK package (TWA) generate karta hai, jise aap APK installer se direct install ya Google Play par daal sakte hain.'
                    : 'PWABuilder is the industry standard tool that packages this Progressive Web App into a ready-to-install unsigned or signed Android APK package.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">
                  {isHindi ? 'Steps:' : 'Quick Steps:'}
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">1</span>
                    <span>Click the &quot;Open PWABuilder APK Generator&quot; button below.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">2</span>
                    <span>Click &quot;Build APK / Package for Android&quot;.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">3</span>
                    <span>Download your compiled <code className="text-emerald-400">.apk</code> file directly to your phone!</span>
                  </div>
                </div>
              </div>

              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 text-center"
              >
                <span>{isHindi ? 'PWABuilder APK Tool Kholein' : 'Open PWABuilder APK Generator'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between items-center text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span>PACKAGE CONFIGURATION</span>
                  <span className="text-emerald-400">PASSING ALL AUDITS</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">App Name:</span> My Year Tracker</div>
                  <div><span className="text-slate-500">Short Name:</span> YearTracker</div>
                  <div><span className="text-slate-500">Package ID:</span> com.yeartracker.pwa</div>
                  <div><span className="text-slate-500">Display:</span> Standalone</div>
                  <div><span className="text-slate-500">Cache Engine:</span> Workbox ServiceWorker</div>
                  <div><span className="text-slate-500">Theme Color:</span> #10b981 (Emerald)</div>
                  <div><span className="text-slate-500">Storage:</span> LocalStorage + IndexedDB</div>
                  <div><span className="text-slate-500">Maskable Icon:</span> 512x512 Safe-Zone</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Google Chrome WebAPK Engine:
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  When installed from Chrome on Android, Google Chrome automatically uses the official WebAPK minting service to synthesize a bona-fide Android APK with standard permissions, background execution, and home-launcher integration without needing unknown sources toggle.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isHindi ? '100% Offline chalne ke liye ready' : '100% Offline Capable & Free'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {isHindi ? 'Close' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
