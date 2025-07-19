/**
 * Matrix Text Animation Component - Consciousness-themed character morphing
 * 
 * Extracted from IntegratedConsciousnessOnboarding for reuse across components
 */

'use client';

import React, { useEffect, useState } from 'react';

interface MatrixTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const MatrixText: React.FC<MatrixTextProps> = ({ 
  text, 
  className = '', 
  delay = 0 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  // Matrix character sets for morphing
  const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const consciousnessChars = '∞∆◊○●◯⬢⬡φπΩΨΦΘΛΞΠΣΥΧΩ⚡⚢⚣⚤⚥⚦⚧⚨⚩⚪⚫⚬⚭⚮⚯';

  useEffect(() => {
    const startAnimation = () => {
      let currentIndex = 0;
      const animationSpeed = 50; // ms per character

      const animate = () => {
        if (currentIndex <= text.length) {
          const completedPart = text.slice(0, currentIndex);
          const remainingLength = text.length - currentIndex;

          // Generate random characters for the remaining part
          const randomPart = Array.from({ length: Math.min(remainingLength, 8) }, () =>
            Math.random() < 0.7
              ? matrixChars[Math.floor(Math.random() * matrixChars.length)]
              : consciousnessChars[Math.floor(Math.random() * consciousnessChars.length)]
          ).join('');

          setDisplayText(completedPart + randomPart);
          currentIndex++;

          if (currentIndex <= text.length) {
            setTimeout(animate, animationSpeed);
          } else {
            setDisplayText(text);
            setIsAnimating(false);
          }
        }
      };

      setTimeout(animate, delay);
    };

    startAnimation();
  }, [text, delay, matrixChars, consciousnessChars]);

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {displayText}
    </span>
  );
};

export default MatrixText;
