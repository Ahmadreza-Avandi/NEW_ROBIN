import React from 'react';

interface LogoComponentProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const EmailLogo: React.FC<LogoComponentProps> = ({
    size = 'medium',
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <img
                src="https://uploadkon.ir/uploads/5c1f19_25x-removebg-preview.png"
                alt="رابین تجارت خاورمیانه"
                className={`${sizeClasses[size]} object-contain`}
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
            />
        </div>
    );
};

// برای استفاده در HTML ایمیل‌ها
export const getEmailLogoHtml = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizeMap = {
        small: { width: 32, height: 32 },
        medium: { width: 48, height: 48 },
        large: { width: 64, height: 64 }
    };

    const { width, height } = sizeMap[size];

    return `
    <img 
      src="https://uploadkon.ir/uploads/5c1f19_25x-removebg-preview.png" 
      alt="رابین تجارت خاورمیانه" 
      width="${width}" 
      height="${height}"
      style="
        width: ${width}px; 
        height: ${height}px; 
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        display: block;
        margin: 0 auto;
      "
    />
  `;
};

export default EmailLogo;