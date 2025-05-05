// filepath: /Users/thabanglenonyana/Enviro365-waste-management/frontend/src/app/features/home/components/hero-section/particles-config.ts
import type { ISourceOptions } from "@tsparticles/engine";
import { MoveDirection, OutMode, StartValueType, AnimationMode } from "@tsparticles/engine";

export const ecoParticlesConfig: ISourceOptions = {
  background: {
    opacity: 0
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 1000, // High density for a clear sphere shape
      density: {
        enable: true,
        width: 450,
        height: 450 // Match the size of our .earth-globe container
      }
    },
    color: {
      // Colors with emphasis on yellow from hero title
      value: [
        "#FFD700",  // Gold/Yellow from hero title
        "#FFC107",  // Amber yellow variation
        "#FFD700",  // Gold/Yellow (duplicate for emphasis)
        "#4CAF50"   // Green color to represent environment
      ]
    },
    shape: {
      type: ["circle"],
      options: {}
    },
    opacity: {
      value: { min: 0.3, max: 0.9 }, // Increased max opacity for better visibility
      animation: {
        enable: true,
        speed: 0.2,
        count: 1,
        sync: false,
        mode: AnimationMode.auto,
        startValue: StartValueType.random,
        decay: 0,
        delay: 0
      }
    },
    size: {
      value: { min: 0.8, max: 6 }, // Larger particles with wider range
      animation: {
        enable: false
      }
    },
    links: {
      enable: false // No links between particles
    },
    move: {
      enable: true, // Enable movement for rotation effect
      speed: 0.15, // Very slow speed for subtle rotation
      direction: MoveDirection.none,
      random: false,
      straight: false,
      outModes: {
        default: OutMode.bounce
      },
      attract: {
        enable: true, 
        rotate: {
          x: 600, // Create rotation around x-axis
          y: 1200  // Stronger rotation around y-axis for earth-like spin
        },
        distance: 150
      },
      center: {
        x: 50,
        y: 50,
        mode: "percent",
        radius: 0
      }
    },
    rotate: {
      value: 0,
      animation: {
        enable: true,
        speed: 0.5,
        sync: false
      },
      direction: "clockwise"
    }
  },
  interactivity: {
    detectsOn: "canvas",
    events: {
      onHover: {
        enable: false // Disable hover interaction
      },
      onClick: {
        enable: false
      },
      resize: {
        enable: true
      }
    }
  },
  detectRetina: true
};
