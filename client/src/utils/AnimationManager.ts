/**
 * AnimationManager - Animation utilities for Havoc Speedway
 * Provides consistent animations, transitions, and visual effects
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface CardAnimationOptions {
  flipDuration?: number;
  dealDelay?: number;
  shuffleIntensity?: number;
  moveDistance?: number;
}

class AnimationManager {
  private static instance: AnimationManager;
  private prefersReducedMotion: boolean;
  private animationQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setupMediaQueryListener();
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * Check if reduced motion is preferred
   */
  shouldReduceMotion(): boolean {
    return this.prefersReducedMotion;
  }

  /**
   * Animate element with Web Animations API
   */
  async animate(
    element: Element, 
    keyframes: Keyframe[], 
    config: AnimationConfig
  ): Promise<void> {
    if (this.prefersReducedMotion) {
      // Apply final state immediately for reduced motion
      const finalKeyframe = keyframes[keyframes.length - 1];
      Object.assign((element as HTMLElement).style, finalKeyframe);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const animation = element.animate(keyframes, {
          duration: config.duration,
          easing: config.easing,
          delay: config.delay || 0,
          fill: config.fillMode || 'forwards'
        });

        animation.addEventListener('finish', () => resolve());
        animation.addEventListener('cancel', () => reject(new Error('Animation cancelled')));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Card flip animation
   */
  async flipCard(element: Element, options: CardAnimationOptions = {}): Promise<void> {
    const duration = options.flipDuration || 600;
    
    const keyframes = [
      { transform: 'rotateY(0deg)', transformStyle: 'preserve-3d' },
      { transform: 'rotateY(90deg)', transformStyle: 'preserve-3d', offset: 0.5 },
      { transform: 'rotateY(180deg)', transformStyle: 'preserve-3d' }
    ];

    await this.animate(element, keyframes, {
      duration,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });
  }

  /**
   * Card dealing animation
   */
  async dealCard(element: Element, index: number, options: CardAnimationOptions = {}): Promise<void> {
    const delay = (options.dealDelay || 100) * index;
    const moveDistance = options.moveDistance || 200;
    
    const keyframes = [
      { 
        transform: `translateX(-${moveDistance}px) translateY(-100px) scale(0.8)`,
        opacity: '0'
      },
      { 
        transform: 'translateX(0) translateY(0) scale(1)',
        opacity: '1'
      }
    ];

    await this.animate(element, keyframes, {
      duration: 800,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      delay
    });
  }

  /**
   * Card shuffle animation
   */
  async shuffleCards(elements: NodeListOf<Element>, options: CardAnimationOptions = {}): Promise<void> {
    const intensity = options.shuffleIntensity || 1;
    const promises = Array.from(elements).map((element, index) => {
      const randomX = (Math.random() - 0.5) * 100 * intensity;
      const randomY = (Math.random() - 0.5) * 50 * intensity;
      const randomRotate = (Math.random() - 0.5) * 30 * intensity;
      
      const keyframes = [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { 
          transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`,
          offset: 0.5
        },
        { transform: 'translate(0, 0) rotate(0deg)' }
      ];

      return this.animate(element, keyframes, {
        duration: 1000 + Math.random() * 500,
        easing: 'ease-in-out',
        delay: index * 50
      });
    });

    await Promise.all(promises);
  }

  /**
   * Fade in animation
   */
  async fadeIn(element: Element, duration = 300): Promise<void> {
    const keyframes = [
      { opacity: '0', transform: 'translateY(10px)' },
      { opacity: '1', transform: 'translateY(0)' }
    ];

    await this.animate(element, keyframes, {
      duration,
      easing: 'ease-out'
    });
  }

  /**
   * Slide up animation
   */
  async slideUp(element: Element, duration = 400): Promise<void> {
    const keyframes = [
      { transform: 'translateY(100%)', opacity: '0' },
      { transform: 'translateY(0)', opacity: '1' }
    ];

    await this.animate(element, keyframes, {
      duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  }

  /**
   * Bounce attention animation
   */
  async bounce(element: Element, intensity = 1): Promise<void> {
    const keyframes = [
      { transform: 'scale(1)' },
      { transform: `scale(${1 + 0.1 * intensity})` },
      { transform: 'scale(1)' }
    ];

    await this.animate(element, keyframes, {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
  }

  /**
   * Glow effect animation
   */
  async glow(element: Element, color = '#ffd700'): Promise<void> {
    const keyframes = [
      { boxShadow: 'none' },
      { boxShadow: `0 0 20px ${color}` },
      { boxShadow: 'none' }
    ];

    await this.animate(element, keyframes, {
      duration: 1000,
      easing: 'ease-in-out'
    });
  }

  /**
   * Shake animation for errors
   */
  async shake(element: Element, intensity = 1): Promise<void> {
    const distance = 10 * intensity;
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: `translateX(-${distance}px)` },
      { transform: `translateX(${distance}px)` },
      { transform: `translateX(-${distance/2}px)` },
      { transform: `translateX(${distance/2}px)` },
      { transform: 'translateX(0)' }
    ];

    await this.animate(element, keyframes, {
      duration: 500,
      easing: 'ease-in-out'
    });
  }

  /**
   * Pulse animation
   */
  startPulse(element: Element, duration = 2000): () => void {
    if (this.prefersReducedMotion) {
      return () => {}; // Return empty cleanup function
    }

    const keyframes = [
      { opacity: '0.7', transform: 'scale(1)' },
      { opacity: '1', transform: 'scale(1.05)' },
      { opacity: '0.7', transform: 'scale(1)' }
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations: Infinity,
      easing: 'ease-in-out'
    });

    return () => animation.cancel();
  }

  /**
   * Queue animation to prevent overlaps
   */
  async queueAnimation(animationFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.animationQueue.push(async () => {
        try {
          await animationFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process animation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.animationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      if (animation) {
        try {
          await animation();
        } catch (error) {
          console.warn('Animation failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Setup media query listener for reduced motion
   */
  private setupMediaQueryListener(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  /**
   * Create staggered animation for multiple elements
   */
  async staggerAnimation(
    elements: Element[], 
    animationFn: (element: Element, index: number) => Promise<void>,
    staggerDelay = 100
  ): Promise<void> {
    const promises = elements.map((element, index) => 
      new Promise<void>(resolve => {
        setTimeout(async () => {
          await animationFn(element, index);
          resolve();
        }, index * staggerDelay);
      })
    );

    await Promise.all(promises);
  }
}

// Game-specific animation presets
export const GameAnimations = {
  // Card animations
  flipCard: (element: Element) => 
    AnimationManager.getInstance().flipCard(element),
  
  dealCard: (element: Element, index: number) => 
    AnimationManager.getInstance().dealCard(element, index),
  
  shuffleCards: (elements: NodeListOf<Element>) => 
    AnimationManager.getInstance().shuffleCards(elements),

  // UI animations
  fadeIn: (element: Element) => 
    AnimationManager.getInstance().fadeIn(element),
  
  slideUp: (element: Element) => 
    AnimationManager.getInstance().slideUp(element),
  
  bounce: (element: Element) => 
    AnimationManager.getInstance().bounce(element),
  
  glow: (element: Element, color?: string) => 
    AnimationManager.getInstance().glow(element, color),
  
  shake: (element: Element) => 
    AnimationManager.getInstance().shake(element),

  // Utility functions
  startPulse: (element: Element) => 
    AnimationManager.getInstance().startPulse(element),
  
  queueAnimation: (animationFn: () => Promise<void>) => 
    AnimationManager.getInstance().queueAnimation(animationFn),

  staggerAnimation: (
    elements: Element[], 
    animationFn: (element: Element, index: number) => Promise<void>
  ) => AnimationManager.getInstance().staggerAnimation(elements, animationFn),

  // Game-specific sequences
  dealerSelectionReveal: async (cardElements: NodeListOf<Element>) => {
    const manager = AnimationManager.getInstance();
    await manager.staggerAnimation(
      Array.from(cardElements),
      (element) => manager.fadeIn(element, 300),
      150
    );
  },

  stormCardPlay: async (cardElement: Element) => {
    const manager = AnimationManager.getInstance();
    await manager.slideUp(cardElement);
    await manager.bounce(cardElement, 0.5);
  },

  toxicSevenWarning: async (warningElement: Element) => {
    const manager = AnimationManager.getInstance();
    await manager.glow(warningElement, '#ff4444');
    await manager.shake(warningElement, 0.8);
  },

  playerJoin: async (playerElement: Element) => {
    const manager = AnimationManager.getInstance();
    await manager.slideUp(playerElement);
    await manager.bounce(playerElement, 0.3);
  },

  messageReceived: async (messageElement: Element) => {
    const manager = AnimationManager.getInstance();
    await manager.fadeIn(messageElement);
  }
};

export const animationManager = AnimationManager.getInstance();
export default AnimationManager;
