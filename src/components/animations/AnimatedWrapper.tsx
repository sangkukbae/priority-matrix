"use client"

import React from "react"

interface AnimatedWrapperProps {
  children: React.ReactNode
  variant?: "fade" | "slide" | "zoom"
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  className?: string
}

export function AnimatedWrapper({
  children,
  variant = "slide",
  direction = "up",
  delay = 0,
  className = "",
}: AnimatedWrapperProps) {
  const directionMap = {
    up: { offset: "20px" },
    down: { offset: "-20px" },
    left: { offset: "20px" },
    right: { offset: "-20px" },
  }

  const variantStyles = {
    fade: {
      opacity: { from: 0, to: 1 },
      transform: "none",
    },
    slide: {
      opacity: { from: 0, to: 1 },
      transform: `translateY(${directionMap[direction].offset})`,
    },
    zoom: {
      opacity: { from: 0, to: 1 },
      transform: "scale(0.95)",
    },
  }

  const style = {
    animation: `${variant}-in 0.4s ease-out ${delay}ms forwards`,
    opacity: 0,
    transform: variantStyles[variant].transform,
  }

  return (
    <div className={className} style={style}>
      <style>{`
        @keyframes slide-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      {children}
    </div>
  )
}

interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  holdDelay?: number
}

export function StaggeredList({ children, className = "", holdDelay = 100 }: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div style={{ animationDelay: `${index * holdDelay}ms` }} className="stagger-item">
          <style>{`
            .stagger-item {
              opacity: 0;
              animation: stagger-in 0.3s ease-out forwards;
            }
            @keyframes stagger-in {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {child}
        </div>
      ))}
    </div>
  )
}
