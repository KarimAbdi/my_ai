import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

// A simple loader component to display while the AI is working.
const Loader: React.FC = () => (
    <div className="flex flex-col items-center gap-4 text-slate-400 p-4 text-center">
        <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold">Creating your masterpiece...</p>
        <p className="text-sm text-slate-500">The AI is working its magic. This can take a few seconds.</p>
    </div>
);

// A component to prompt the user to select their API key.
const ApiKeyPrompt: React.FC<{ onSelect: () => void }> = ({ onSelect }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h3 className="font-bold text-lg text-yellow-300">API Key Required</h3>
        <p className="mt-2 text-slate-400">
            To power the AI magic, please select your Google AI API key.
        </p>
        <button
            onClick={onSelect}
            className="mt-6 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
            Select API Key
        </button>
    </div>
);


interface EditorProps {
    image: string;
    onReset: () => void;
}

const Editor: React.FC<EditorProps> = ({ image, onReset }) => {
    const [cartoonifiedImage, setCartoonifiedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);

    const checkApiKey = useCallback(async () => {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeyReady(hasKey);
            return hasKey;
        } catch (e) {
            console.error("Error checking for API key:", e);
            setApiKeyReady(false);
            return false;
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        setError(null); // Clear previous errors before trying again
        try {
            await window.aistudio.openSelectKey();
            // After the dialog closes, re-check for the key.
            // This optimistically triggers the generation effect.
            setApiKeyReady(true);
        } catch (e) {
            console.error("Error opening select key dialog:", e);
            setError("Could not open the API key selection dialog. Please try again.");
            setApiKeyReady(false); // Explicitly ensure we show the prompt/error again
        }
    };

    useEffect(() => {
        if (!image || !apiKeyReady) return;

        const generateCartoon = async () => {
            setIsGenerating(true);
            setError(null);
            setCartoonifiedImage(null);

            try {
                // The AI Studio environment injects the key via process.env
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

                const imageParts = image.split(';base64,');
                if (imageParts.length < 2) {
                    throw new Error("Invalid image data URL format. Please upload a valid image.");
                }
                const mimeType = imageParts[0].split(':')[1];
                const base64ImageData = imageParts[1];

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash-image',
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          data: base64ImageData,
                          mimeType: mimeType,
                        },
                      },
                      {
                        text: 'Transform this photo into a cartoon-style portrait, mimicking the look of a modern 3D animated movie. The style should be vibrant, artistic, and polished with smooth features.',
                      },
                    ],
                  },
                  config: {
                      responseModalities: [Modality.IMAGE],
                  },
                });

                let foundImage = false;
                if (response.candidates && response.candidates.length > 0) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64ImageBytes: string = part.inlineData.data;
                            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                            setCartoonifiedImage(imageUrl);
                            foundImage = true;
                            break;
                        }
                    }
                }
                
                if (!foundImage) {
                    throw new Error("The AI couldn't generate a cartoon for this image. It might be an unsupported format or content. Please try a different photo.");
                }

            } catch (e: any) {
                console.error(e);
                if (e.message?.includes('API key not valid') || e.message?.includes('Requested entity was not found')) {
                    setError("Your API key appears to be invalid. Please select a valid key.");
                    setApiKeyReady(false); // Reset to prompt for a key again
                } else {
                    setError(e.message || "An unexpected error occurred. Please try again.");
                }
            } finally {
                setIsGenerating(false);
            }
        };

        generateCartoon();
    }, [image, apiKeyReady]);

    const handleDownload = useCallback(() => {
        if (!cartoonifiedImage) return;
        
        const link = document.createElement('a');
        link.download = 'cartoonified-image.png';
        link.href = cartoonifiedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [cartoonifiedImage]);

    const renderContent = () => {
        if (error) {
            return (
                <div className="p-4 text-center text-red-400">
                    <p className="font-semibold">Oh no! Something went wrong.</p>
                    <p className="text-sm mt-2">{error}</p>
                    {/* If the error is an API key issue, allow the user to try again */}
                    {!apiKeyReady && (
                        <button
                            onClick={handleSelectKey}
                            className="mt-6 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                        >
                            Select API Key
                        </button>
                    )}
                </div>
            );
        }
        if (!apiKeyReady) {
            return <ApiKeyPrompt onSelect={handleSelectKey} />;
        }
        if (isGenerating) {
            return <Loader />;
        }
        if (cartoonifiedImage) {
            return <img src={cartoonifiedImage} alt="Cartoonified" className="w-full h-full object-contain" />;
        }
        return (
            <div className="p-4 text-center text-slate-400">
                <p>Your cartoon will appear here.</p>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full">
                {/* Original Image */}
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-300 mb-4">Original</h2>
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-800 shadow-lg ring-1 ring-white/10">
                        <img src={image} alt="Original" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Cartoonified Image */}
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-300 mb-4">Cartoonified</h2>
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-800 shadow-lg ring-1 ring-white/10 flex items-center justify-center">
                       {renderContent()}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                 <button
                    onClick={onReset}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    Choose Another Photo
                </button>
                <button
                    onClick={handleDownload}
                    disabled={isGenerating || !cartoonifiedImage}
                    className="cartoon-button px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg border-2 border-slate-900 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Download Cartoon
                </button>
            </div>
        </div>
    );
};

export default Editor;
