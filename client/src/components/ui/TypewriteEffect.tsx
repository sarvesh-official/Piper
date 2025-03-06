import { useEffect, useState, useRef } from "react";

interface TypewriterEffectProps {
  words: string[];
  speed?: number;
  delay?: number;
  className?: string;
}

export const TypewriterEffect = ({
  words,
  speed = 100,
  delay = 1500,
  className = "",
}: TypewriterEffectProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isMounted.current) return;

      if (isWaiting) {
        setIsWaiting(false);
        setIsDeleting(true);
        return;
      }

      const currentWord = words[currentWordIndex];
      
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === currentWord) {
        setIsWaiting(true);
        return;
      }

      if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }

    }, isWaiting ? delay : isDeleting ? speed / 1.2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentWordIndex, isDeleting, isWaiting, speed, words, delay]);

  return (
    <span className={`inline-block relative ${className} py-2`}>
      {currentText}
      <span className="animate-blink">|</span>
    </span>
  );
};

export default TypewriterEffect;