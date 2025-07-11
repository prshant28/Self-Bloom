/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      // Advanced Animation Keyframes
      keyframes: {
        // AI-Enhanced Animations
        'ai-float': {
          '0%, 100%': { 
            transform: 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)',
            filter: 'hue-rotate(0deg) brightness(1)'
          },
          '25%': { 
            transform: 'translateY(-30px) rotateX(15deg) rotateY(90deg) scale(1.1)',
            filter: 'hue-rotate(90deg) brightness(1.2)'
          },
          '50%': { 
            transform: 'translateY(-60px) rotateX(0deg) rotateY(180deg) scale(1.2)',
            filter: 'hue-rotate(180deg) brightness(1.4)'
          },
          '75%': { 
            transform: 'translateY(-30px) rotateX(-15deg) rotateY(270deg) scale(1.1)',
            filter: 'hue-rotate(270deg) brightness(1.2)'
          }
        },
        
        // Liquid/Fluid Animations
        'liquid-morph': {
          '0%, 100%': {
            'border-radius': '50% 50% 50% 50%',
            transform: 'rotate(0deg) scale(1)'
          },
          '25%': {
            'border-radius': '60% 40% 30% 70%',
            transform: 'rotate(90deg) scale(1.1)'
          },
          '50%': {
            'border-radius': '30% 70% 60% 40%',
            transform: 'rotate(180deg) scale(0.9)'
          },
          '75%': {
            'border-radius': '70% 30% 40% 60%',
            transform: 'rotate(270deg) scale(1.05)'
          }
        },
        
        // Synthwave Grid Animation
        'synthwave-grid': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-80px, -80px)' }
        },
        
        // Advanced Text Animations
        'text-reveal': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(100px) rotateX(90deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) rotateX(0deg)'
          }
        },
        
        'glitch': {
          '0%, 100%': {
            transform: 'translateX(0) translateY(0) skew(0deg)',
            filter: 'hue-rotate(0deg) contrast(1)'
          },
          '10%': {
            transform: 'translateX(-5px) translateY(2px) skew(-2deg)',
            filter: 'hue-rotate(90deg) contrast(1.5)'
          },
          '20%': {
            transform: 'translateX(5px) translateY(-2px) skew(2deg)',
            filter: 'hue-rotate(180deg) contrast(2)'
          },
          '30%': {
            transform: 'translateX(-2px) translateY(1px) skew(-1deg)',
            filter: 'hue-rotate(270deg) contrast(1.2)'
          }
        },
        
        // Particle System Animations
        'particle-float': {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(-20px) translateX(10px) rotate(180deg)',
            opacity: '0.7'
          }
        },
        
        // 3D Perspective Animations
        'cube-rotate': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
          '33%': { transform: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg)' },
          '66%': { transform: 'rotateX(90deg) rotateY(90deg) rotateZ(0deg)' },
          '100%': { transform: 'rotateX(90deg) rotateY(90deg) rotateZ(90deg)' }
        },
        
        // Holographic Effects
        'hologram': {
          '0%, 100%': {
            'background-position': '0% 50%',
            filter: 'hue-rotate(0deg) brightness(1)'
          },
          '50%': {
            'background-position': '100% 50%',
            filter: 'hue-rotate(180deg) brightness(1.5)'
          }
        },
        
        // Neon Glow Pulse
        'neon-pulse': {
          '0%, 100%': {
            'box-shadow': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            filter: 'brightness(1)'
          },
          '50%': {
            'box-shadow': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor',
            filter: 'brightness(1.5)'
          }
        },
        
        // Micro-interactions
        'micro-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        
        'ripple': {
          '0%': {
            transform: 'scale(0)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0'
          }
        }
      },
      
      // Animation Utilities
      animation: {
        // AI-Enhanced
        'ai-float': 'ai-float 6s ease-in-out infinite',
        'ai-float-delayed': 'ai-float 6s ease-in-out infinite 1s',
        
        // Liquid Effects
        'liquid-morph': 'liquid-morph 8s ease-in-out infinite',
        'liquid-morph-slow': 'liquid-morph 12s ease-in-out infinite',
        
        // Synthwave
        'synthwave-grid': 'synthwave-grid 10s linear infinite',
        'synthwave-grid-fast': 'synthwave-grid 5s linear infinite',
        
        // Text Animations
        'text-reveal': 'text-reveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'text-reveal-delayed': 'text-reveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both',
        'glitch': 'glitch 0.5s ease-in-out infinite',
        'glitch-slow': 'glitch 2s ease-in-out infinite',
        
        // Particle System
        'particle-float': 'particle-float 4s ease-in-out infinite',
        'particle-float-random': 'particle-float 6s ease-in-out infinite reverse',
        
        // 3D Effects
        'cube-rotate': 'cube-rotate 3s linear infinite',
        'cube-rotate-slow': 'cube-rotate 6s linear infinite',
        
        // Holographic
        'hologram': 'hologram 3s ease-in-out infinite',
        'hologram-fast': 'hologram 1.5s ease-in-out infinite',
        
        // Neon Effects
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'neon-pulse-fast': 'neon-pulse 1s ease-in-out infinite',
        
        // Micro-interactions
        'micro-bounce': 'micro-bounce 0.3s ease-in-out',
        'ripple': 'ripple 0.6s ease-out'
      },
      
      // Advanced Color Palettes
      colors: {
        // Synthwave/Cyberpunk
        synthwave: {
          pink: '#ff00ff',
          cyan: '#00ffff',
          purple: '#8a2be2',
          neon: '#39ff14',
          dark: '#0a0a0a',
          grid: '#ff00ff'
        },
        
        // Holographic
        hologram: {
          base: '#ffffff',
          shift1: '#ff00ff',
          shift2: '#00ffff',
          shift3: '#ffff00',
          shift4: '#ff0080'
        },
        
        // AI Theme
        ai: {
          primary: '#4f46e5',
          secondary: '#06b6d4',
          accent: '#f59e0b',
          neural: '#8b5cf6',
          data: '#10b981'
        }
      },
      
      // Advanced Gradients
      backgroundImage: {
        'synthwave-grid': `
          linear-gradient(90deg, transparent 79px, #ff00ff 81px, #ff00ff 82px, transparent 84px),
          linear-gradient(transparent 79px, #00ffff 81px, #00ffff 82px, transparent 84px)
        `,
        'hologram-shift': 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
        'ai-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'liquid-gradient': 'radial-gradient(circle at 30% 30%, #ff9a9e, #fecfef, #fecfef)',
        'neon-glow': 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)'
      },
      
      // Custom Spacing for Animations
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      // Animation Timing Functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ai-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      
      // Custom Filters
      filter: {
        'neon': 'drop-shadow(0 0 10px currentColor)',
        'hologram': 'hue-rotate(180deg) brightness(1.2)',
        'glitch': 'contrast(1.5) hue-rotate(90deg)'
      },
      
      // Perspective for 3D
      perspective: {
        '500': '500px',
        '1000': '1000px',
        '1500': '1500px'
      },
      
      // Transform Origins
      transformOrigin: {
        'center-3d': '50% 50% 0',
        'top-3d': '50% 0% 0',
        'bottom-3d': '50% 100% 0'
      }
    }
  },
  
  plugins: [
    // Custom Plugin for Advanced Animations
    function({ addUtilities, theme }) {
      const newUtilities = {
        // 3D Transform Utilities
        '.preserve-3d': {
          'transform-style': 'preserve-3d'
        },
        '.perspective-1000': {
          'perspective': '1000px'
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden'
        },
        
        // Neon Text Effect
        '.text-neon': {
          'text-shadow': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor, 0 0 20px currentColor'
        },
        
        // Holographic Text
        '.text-hologram': {
          'background': 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
          'background-size': '400% 400%',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'animation': 'hologram 3s ease-in-out infinite'
        },
        
        // Glitch Effect
        '.glitch-effect': {
          'position': 'relative',
          '&::before, &::after': {
            'content': 'attr(data-text)',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%'
          },
          '&::before': {
            'animation': 'glitch 0.3s ease-in-out infinite alternate-reverse',
            'color': '#ff00ff',
            'z-index': '-1'
          },
          '&::after': {
            'animation': 'glitch 0.3s ease-in-out infinite alternate-reverse',
            'color': '#00ffff',
            'z-index': '-2'
          }
        },
        
        // Liquid Container
        '.liquid-container': {
          'filter': 'blur(1px)',
          'background': 'radial-gradient(circle at 30% 30%, #ff9a9e, #fecfef, #fecfef)',
          'border-radius': '50%'
        },
        
        // Interactive Hover States
        '.hover-lift': {
          'transition': 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            'transform': 'translateY(-10px) scale(1.05)',
            'box-shadow': '0 20px 40px rgba(0,0,0,0.3)'
          }
        },
        
        // Particle Effect Container
        '.particle-container': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            'background-size': '20px 20px',
            'animation': 'particle-float 4s ease-in-out infinite',
            'pointer-events': 'none'
          }
        }
      }
      
      addUtilities(newUtilities)
    }
  ]
}
