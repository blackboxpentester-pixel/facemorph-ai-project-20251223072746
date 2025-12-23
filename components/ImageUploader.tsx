
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  currentImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 min-h-[400px] flex items-center justify-center overflow-hidden
          ${currentImage ? 'border-transparent' : 'border-zinc-700 hover:border-red-500 bg-zinc-900/50'}`}
      >
        {currentImage ? (
          <>
            <img src={currentImage} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium bg-red-600 px-4 py-2 rounded-full text-sm">Change Image</span>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="mb-4 text-zinc-500 group-hover:text-red-500 transition-colors">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-zinc-400 font-medium">Click or Drag to Upload Reference Image</p>
            <p className="text-zinc-600 text-sm mt-1">Supports JPG, PNG</p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
