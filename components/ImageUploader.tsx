import React, { useCallback, useState } from 'react';

const UploadIcon: React.FC = () => (
    <svg className="w-12 h-12 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 21v-3.75m-18 0V9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 9v8.25" />
    </svg>
);

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    const borderStyle = isDragging ? 'border-purple-500 scale-105' : 'border-slate-600';

    return (
        <div 
            className={`w-full max-w-2xl p-8 text-center border-2 border-dashed ${borderStyle} rounded-2xl bg-slate-800/50 transition-all duration-300 cursor-pointer hover:border-purple-400`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
        >
            <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                <UploadIcon />
                <p className="text-slate-300">
                    <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF, or WEBP</p>
            </div>
        </div>
    );
};

export default ImageUploader;
