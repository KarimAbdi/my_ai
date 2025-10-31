import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Editor from './components/Editor';

const App: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = useCallback(() => {
        setImage(null);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <Header />
            <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center mt-8">
                {image ? (
                    <Editor image={image} onReset={handleReset} />
                ) : (
                    <ImageUploader onImageUpload={handleImageUpload} />
                )}
            </main>
             <footer className="text-center p-4 mt-8 text-slate-500 text-sm">
                <p>2025</p>
            </footer>
        </div>
    );
};

export default App;
