import React from 'react';

interface LogoProps {
    className?: string; // Container class
    iconClassName?: string; // SVG class
    textClassName?: string; // Text wrapper class
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    iconClassName = "h-8 w-8",
    textClassName = "text-2xl font-bold tracking-tight",
    showText = true
}) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* MaalemPro Geometric M Logo */}
            <svg
                viewBox="0 0 100 100"
                className={iconClassName}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="gradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#E2E8F0" />
                    </linearGradient>
                    <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                </defs>

                {/* Left Part: House/Arrow Pillar */}
                <path
                    d="M20 85 V35 L50 65 V85 H35 V70 L20 55 V85 Z"
                    fill="url(#gradLeft)"
                />
                <path
                    d="M20 35 L50 65 L50 25 L20 35 Z"
                    fill="url(#gradLeft)"
                    opacity="0.9"
                />

                {/* Right Part: Wrench/Tool Pillar */}
                <path
                    d="M50 85 V65 L80 35 V50 C80 42 88 42 88 50 C88 58 80 58 80 58 L80 85 H50 Z"
                    fill="url(#gradRight)"
                />
                {/* Wrench Cutout Detail */}
                <circle cx="84" cy="50" r="3" fill="#020617" />
            </svg>

            {showText && (
                <div className={textClassName}>
                    <span className="text-white">MAALEM</span>
                    <span className="text-[#06B6D4]">PRO</span>
                </div>
            )}
        </div>
    );
};
