
import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImage } from './services/geminiService';
import { ImageState, GenerationStatus } from './types';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageState>({
    original: null,
    edited: null,
  });
  const [prompt, setPrompt] = useState('Change the face to a different person with striking features, keeping the same expression and looking directly at the camera. Maintain the iconic red furry hat and background.');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<GenerationStatus>({
    loading: false,
    error: null,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!images.original) return;

    setStatus({ loading: true, error: null });
    try {
      const result = await editImage(images.original, prompt, seed);
      setImages(prev => ({ ...prev, edited: result }));
      setStatus({ loading: false, error: null });
    } catch (err: any) {
      setStatus({ loading: false, error: err.message });
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const resetAll = () => {
    setImages({ original: null, edited: null });
    setSeed(undefined);
    setStatus({ loading: false, error: null });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-red-500/30 pb-safe">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">F</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">FaceMorph</h1>
          </div>
          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 animate-pulse"
              >
                Install App
              </button>
            )}
            {images.original && (
              <button 
                onClick={resetAll}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-md font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Editor
              </h2>
              
              <div className="space-y-4">
                <ImageUploader 
                  currentImage={images.original} 
                  onImageSelect={(img) => setImages({ ...images, original: img, edited: null })}
                />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Modification Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none h-24"
                    placeholder="Describe changes..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-500 uppercase">Seed</label>
                    <button 
                      onClick={randomizeSeed}
                      className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1"
                    >
                      Randomize
                    </button>
                  </div>
                  <input 
                    type="number"
                    value={seed === undefined ? '' : seed}
                    onChange={(e) => setSeed(e.target.value === '' ? undefined : parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-sm outline-none"
                    placeholder="Enter seed number..."
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full h-12"
                  isLoading={status.loading}
                  disabled={!images.original}
                >
                  Morph Face
                </Button>

                {status.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {status.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Input</span>
                <div className="aspect-[3/4] rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden relative">
                  {images.original ? (
                    <img src={images.original} className="w-full h-full object-cover" alt="Original" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-sm">Waiting for upload...</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Result</span>
                <div className="aspect-[3/4] rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden relative shadow-2xl shadow-red-500/5">
                  {status.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/80">
                      <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                      <p className="text-xs text-zinc-400">Processing Face...</p>
                    </div>
                  ) : images.edited ? (
                    <>
                      <img src={images.edited} className="w-full h-full object-cover" alt="Edited" />
                      <a 
                        href={images.edited} 
                        download="morphed.png"
                        className="absolute bottom-3 right-3 bg-red-600 p-2 rounded-lg text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-sm italic">Result will appear here</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
