const ImageUpload = ({ preview, handleFile }) => {
  return (
    <div className="mb-8">
      <label className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${preview ? 'border-transparent' : 'border-gray-600 hover:border-gray-400 hover:bg-white/5'}`}>
        <input type="file" onChange={handleFile} accept="image/*" className="hidden" aria-label="Upload image" />
        
        {preview ? (
          <>
            <img src={preview} alt="User Preview" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white font-bold">Change Image</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-sm font-semibold">Click to upload photo</p>
            <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG</p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;