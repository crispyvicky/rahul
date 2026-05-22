"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Vector2D {
  x: number;
  y: number;
}

const BRAND_RED = { r: 235, g: 0, b: 0 };
const BRAND_WHITE = { r: 255, g: 255, b: 255 };
const BRAND_DIM = { r: 120, g: 20, b: 20 };

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };

  closeEnoughTarget = 100;
  maxSpeed = 1.0;
  maxForce = 0.1;
  particleSize = 10;
  isKilled = false;

  startColor = { r: 0, g: 0, b: 0 };
  targetColor = { r: 0, g: 0, b: 0 };
  colorWeight = 0;
  colorBlendRate = 0.01;

  move() {
    let proximityMult = 1;
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2)
    );

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };

    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    );
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce;
      steer.y = (steer.y / steerMagnitude) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }

    const currentColor = {
      r: Math.round(
        this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight
      ),
      g: Math.round(
        this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight
      ),
      b: Math.round(
        this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight
      ),
    };

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const randomPos = generateRandomPos(width / 2, height / 2, (width + height) / 2);
      this.target.x = randomPos.x;
      this.target.y = randomPos.y;

      this.startColor = {
        r:
          this.startColor.r +
          (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g:
          this.startColor.g +
          (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b:
          this.startColor.b +
          (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

function generateRandomPos(x: number, y: number, mag: number): Vector2D {
  const randomX = Math.random() * 1000;
  const randomY = Math.random() * 500;
  const direction = { x: randomX - x, y: randomY - y };
  const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  if (magnitude > 0) {
    direction.x = (direction.x / magnitude) * mag;
    direction.y = (direction.y / magnitude) * mag;
  }
  return { x: x + direction.x, y: y + direction.y };
}

function pickBrandColor(wordIndex: number) {
  const palette = [BRAND_RED, BRAND_WHITE, BRAND_DIM];
  const base = palette[wordIndex % palette.length];
  return {
    r: Math.min(255, base.r + Math.floor(Math.random() * 30)),
    g: Math.min(255, base.g + Math.floor(Math.random() * 30)),
    b: Math.min(255, base.b + Math.floor(Math.random() * 30)),
  };
}

export interface ParticleTextEffectProps {
  /** Words cycled on the canvas (default: RahulFitzz evolution set) */
  words?: string[];
  className?: string;
  canvasClassName?: string;
  /** Show interaction hint below canvas */
  showHint?: boolean;
}

const DEFAULT_WORDS = ["THE EVOLUTION", "PROVEN", "DISCIPLINE", "RAHULFITZZ"];

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  className,
  canvasClassName,
  showHint = false,
}: ParticleTextEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const wordIndexRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false });
  const wordsRef = useRef(words);

  const pixelSteps = 4; // Decreased to increase particle density for fully formed text
  const drawAsPoints = false; // Draw as tiny circles or squares

  wordsRef.current = words;

  const nextWord = useCallback((word: string, canvas: HTMLCanvasElement, colorIndex: number) => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (!offscreenCtx) return;

    let fontSize = Math.max(36, Math.min(180, Math.floor(canvas.width * 0.12)));
    offscreenCtx.fillStyle = "white";
    offscreenCtx.font = `900 ${fontSize}px Orbitron, Arial Black, sans-serif`;
    
    // Dynamically scale down font if the text is wider than the canvas
    let textMetrics = offscreenCtx.measureText(word);
    if (textMetrics.width > canvas.width * 0.85) {
      fontSize = Math.floor(fontSize * ((canvas.width * 0.85) / textMetrics.width));
      offscreenCtx.font = `900 ${fontSize}px Orbitron, Arial Black, sans-serif`;
    }

    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2);

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const newColor = pickBrandColor(colorIndex);
    const particles = particlesRef.current;
    let particleIndex = 0;

    const coordsIndexes: { x: number; y: number }[] = [];
    for (let y = 0; y < canvas.height; y += pixelSteps) {
      for (let x = 0; x < canvas.width; x += pixelSteps) {
        const pixelIndex = (y * canvas.width + x) * 4;
        if (pixels[pixelIndex + 3] > 0) { // Check alpha
          coordsIndexes.push({ x, y });
        }
      }
    }

    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
    }

    for (const coord of coordsIndexes) {
      const { x, y } = coord;

        let particle: Particle;

        if (particleIndex < particles.length) {
          particle = particles[particleIndex];
          particle.isKilled = false;
          particleIndex++;
        } else {
          particle = new Particle();
          const randomPos = generateRandomPos(
            canvas.width / 2,
            canvas.height / 2,
            (canvas.width + canvas.height) / 2
          );
          particle.pos.x = randomPos.x;
          particle.pos.y = randomPos.y;
          particle.maxSpeed = Math.random() * 8 + 6; // Faster movement
          particle.maxForce = particle.maxSpeed * 0.1; // Stronger steering force
          particle.particleSize = Math.random() * 2 + 2; // Smaller particles for clearer text
          particle.colorBlendRate = Math.random() * 0.05 + 0.01; // Faster color blend
          particles.push(particle);
        }

        particle.startColor = {
          r:
            particle.startColor.r +
            (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g:
            particle.startColor.g +
            (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b:
            particle.startColor.b +
            (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        };
        particle.targetColor = newColor;
        particle.colorWeight = 0;
        particle.target.x = x;
        particle.target.y = y;
    }

    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeAndInit = () => {
      const w = Math.max(280, container.clientWidth);
      const h = Math.max(140, Math.round(w * 0.35)); // Adjusted ratio slightly for hero
      canvas.width = w;
      canvas.height = h;
      const list = wordsRef.current;
      if (list.length > 0) {
        nextWord(list[wordIndexRef.current], canvas, wordIndexRef.current);
      }
    };

    resizeAndInit();
    const ro = new ResizeObserver(resizeAndInit);
    ro.observe(container);

    const animate = () => {
      const c = canvasRef.current;
      if (!c) return;

      const ctx = c.getContext("2d");
      if (!ctx) return;

      const particles = particlesRef.current;
      // Draw background correctly for seamless hero
      ctx.fillStyle = "rgba(5, 5, 5, 0.12)";
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.move();
        particle.draw(ctx, drawAsPoints);

        if (particle.isKilled) {
          if (
            particle.pos.x < 0 ||
            particle.pos.x > c.width ||
            particle.pos.y < 0 ||
            particle.pos.y > c.height
          ) {
            particles.splice(i, 1);
          }
        }
      }

      if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
        particles.forEach((particle) => {
          const distance = Math.sqrt(
            Math.pow(particle.pos.x - mouseRef.current.x, 2) +
              Math.pow(particle.pos.y - mouseRef.current.y, 2)
          );
          if (distance < 50) {
            particle.kill(c.width, c.height);
          }
        });
      }

      frameCountRef.current++;
      const list = wordsRef.current;
      if (list.length > 1 && frameCountRef.current % 420 === 0) { // Increased to 7 seconds per word
        wordIndexRef.current = (wordIndexRef.current + 1) % list.length;
        nextWord(list[wordIndexRef.current], c, wordIndexRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed = true;
      mouseRef.current.isRightClick = e.button === 2;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false;
      mouseRef.current.isRightClick = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      ro.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      particlesRef.current = [];
      frameCountRef.current = 0;
    };
  }, [nextWord]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full flex flex-col items-center", className)}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full max-w-full h-auto rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(235,0,0,0.08)] touch-none",
          canvasClassName
        )}
        aria-label={words.join(", ")}
      />
      {showHint && (
        <p className="mt-3 text-text-secondary text-[10px] sm:text-xs text-center max-w-md px-4 tracking-wide">
          Right-click and drag to scatter particles · Words cycle automatically
        </p>
      )}
    </div>
  );
}
