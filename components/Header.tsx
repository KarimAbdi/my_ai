import React from 'react';

const Header: React.FC = () => (
    <header className="text-center w-full">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Photo Cartoonizer
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Transform your photos into stunning cartoon-style portraits with the power of AI!
        </p>
    </header>
);

export default Header;