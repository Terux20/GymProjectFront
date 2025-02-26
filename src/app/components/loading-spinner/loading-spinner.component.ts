// src/app/shared/loading-spinner/loading-spinner.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-loading-spinner',
    template: `
    <svg
      class="container"
      viewBox="0 0 40 40"
      height="40"
      width="40"
    >
      <circle 
        class="track"
        cx="20" 
        cy="20" 
        r="17.5" 
        pathlength="100" 
        stroke-width="5px" 
        fill="none" 
      />
      <circle 
        class="car"
        cx="20" 
        cy="20" 
        r="17.5" 
        pathlength="100" 
        stroke-width="5px" 
        fill="none" 
      />
    </svg>
  `,
    styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .container {
      --uib-size: 100px;
      --uib-color: #2c3e50;
      --uib-speed: 2s;
      --uib-bg-opacity: 0.1;
      height: var(--uib-size);
      width: var(--uib-size);
      transform-origin: center;
      animation: rotate var(--uib-speed) linear infinite;
      will-change: transform;
      overflow: visible;
    }

    .car {
      fill: none;
      stroke: var(--uib-color);
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
      stroke-linecap: round;
      animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out infinite;
      will-change: stroke-dasharray, stroke-dashoffset;
      transition: stroke 0.5s ease;
    }

    .track {
      fill: none;
      stroke: var(--uib-color);
      opacity: var(--uib-bg-opacity);
      transition: stroke 0.5s ease;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes stretch {
      0% {
        stroke-dasharray: 0, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 75, 150;
        stroke-dashoffset: -25;
      }
      100% {
        stroke-dashoffset: -100;
      }
    }
  `],
    standalone: false
})
export class LoadingSpinnerComponent {}