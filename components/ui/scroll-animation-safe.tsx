"use client";

import { ReactNode, useEffect, useState, useRef } from "react";

export function ScrollAnimation({
  children,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay * 1000);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px",
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay]);

  const getTransformStyle = () => {
    if (isVisible) {
      return "translate-y-0 translate-x-0 opacity-100";
    }

    switch (direction) {
      case "up":
        return "translate-y-12 opacity-0";
      case "down":
        return "-translate-y-12 opacity-0";
      case "left":
        return "translate-x-12 opacity-0";
      case "right":
        return "-translate-x-12 opacity-0";
      default:
        return "translate-y-12 opacity-0";
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getTransformStyle()}`}
    >
      {children}
    </div>
  );
}
