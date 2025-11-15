import React, { useState } from 'react';

const InteractiveIllustration: React.FC = () => {
    const [animatedElements, setAnimatedElements] = useState<Record<string, boolean>>({});

    const handleAnimation = (id: string) => {
        // Prevent re-triggering animation while it's playing
        if (animatedElements[id]) return;

        setAnimatedElements(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setAnimatedElements(prev => ({ ...prev, [id]: false }));
        }, 600); // Duration should match the longest animation
    };

    return (
        <div className="w-full aspect-video bg-sky-200 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Background */}
                <rect width="400" height="225" fill="#a7dff9"/>
                <path d="M-5 180 C80 150, 250 220, 405 180 L405 225 L-5 225 Z" fill="#78c46c"/>
                <circle cx="50" cy="50" r="20" fill="#fde047" />

                {/* Tree */}
                <rect x="280" y="80" width="20" height="110" fill="#8c5a2b" />
                <circle cx="290" cy="80" r="40" fill="#4a9a2a" />
                <circle cx="270" cy="70" r="35" fill="#5cb83a" />
                <circle cx="310" cy="65" r="30" fill="#5cb83a" />

                {/* Rabbit's Burrow */}
                <path d="M70 185 a 15 15 0 0 1 30 0 Z" fill="#6b4624" />

                {/* Carpenter */}
                <g onClick={() => handleAnimation('carpenter')} className="cursor-pointer group">
                    <title>José el Carpintero</title>
                    {/* Body */}
                    <rect x="150" y="140" width="40" height="50" rx="10" fill="#4a90e2" />
                     {/* Head */}
                    <circle cx="170" cy="125" r="15" fill="#f5a623"/>
                    {/* Waving Arm */}
                    <g className={animatedElements['carpenter'] ? 'animate-wave' : ''}>
                        <rect x="180" y="140" width="15" height="35" rx="5" fill="#f5a623" transform="rotate(45 180 140)"/>
                    </g>
                </g>

                {/* Bird */}
                <g onClick={() => handleAnimation('bird')} className="cursor-pointer group">
                     <title>Pajarito</title>
                    <g className={animatedElements['bird'] ? 'animate-chirp' : ''}>
                        <circle cx="265" cy="45" r="8" fill="#f8e71c" />
                        <path d="M263 42 L260 40 L263 38 Z" fill="#f5a623" />
                    </g>
                </g>

                 {/* Rabbit */}
                <g onClick={() => handleAnimation('rabbit')} className="cursor-pointer group">
                    <title>Conejo</title>
                    <g className={animatedElements['rabbit'] ? 'animate-hop' : ''}>
                        {/* Body */}
                        <path d="M80 170 a 10 10 0 0 1 20 0 Z" fill="#d8d8d8" />
                        {/* Head */}
                        <circle cx="90" cy="160" r="8" fill="#ffffff" />
                        {/* Ears */}
                        <path d="M85 152 a 3 8 0 0 1 6 0 Z" fill="#ffffff" transform="rotate(-15 88 152)" />
                        <path d="M91 152 a 3 8 0 0 1 6 0 Z" fill="#ffffff" transform="rotate(15 94 152)" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default InteractiveIllustration;
