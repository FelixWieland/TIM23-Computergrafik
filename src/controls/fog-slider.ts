export class FogSlider {
    private sliderContainer: HTMLElement;
    private sliderTrack: HTMLElement;
    private sliderHandle: HTMLElement;
    private sliderFill: HTMLElement;
    private fogIcon: HTMLElement;
    private densityDisplay: HTMLElement;
    private onDensityChangeCallback?: (density: number) => void;
    private isDragging: boolean = false;
    private currentDensity: number = 0.0; // Default: no fog
    private maxDensity: number = 0.01; // Maximum fog density (reasonable value for FogExp2)

    constructor() {
        this.sliderContainer = document.getElementById('fog-slider') as HTMLElement;
        this.sliderTrack = this.sliderContainer.querySelector('.time-slider-track') as HTMLElement;
        this.sliderHandle = document.getElementById('fog-slider-handle') as HTMLElement;
        this.sliderFill = this.sliderContainer.querySelector('.time-slider-fill') as HTMLElement;
        this.fogIcon = document.getElementById('fog-icon') as HTMLElement;
        this.densityDisplay = document.getElementById('fog-density-display') as HTMLElement;

        this.setupEventListeners();
        this.updateSlider();
        this.updateDensityDisplay();
    }

    private setupEventListeners(): void {
        // Handle slider track clicks
        this.sliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.sliderTrack) {
                this.handleTrackClick(e);
            }
        });

        // Handle handle dragging
        this.sliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDragging(e);
        });

        // Handle touch events for mobile
        this.sliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDragging(e.touches[0]);
        });

        // Prevent clicks inside the slider container from closing it
        this.sliderContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Global mouse/touch events for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.handleDrag(e.touches[0]);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDragging();
        });

        document.addEventListener('touchend', () => {
            this.stopDragging();
        });

        // Close slider when clicking outside
        document.addEventListener('click', (e) => {
            const fogButton = document.getElementById('fog-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotFogButton = e.target !== fogButton;
            
            if (isOutsideSlider && isNotFogButton && this.isOpen()) {
                this.close();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    public show(): void {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    public close(): void {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    public isOpen(): boolean {
        return this.sliderContainer.classList.contains('show');
    }

    private startDragging(e: MouseEvent | Touch): void {
        this.isDragging = true;
        this.sliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    private handleDrag(e: MouseEvent | Touch): void {
        if (!this.isDragging) return;

        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentDensity = percentage * this.maxDensity;
        this.updateSlider();
        this.updateDensityDisplay();
        this.notifyDensityChange();
    }

    private stopDragging(): void {
        this.isDragging = false;
        this.sliderHandle.style.cursor = 'grab';
    }

    private handleTrackClick(e: MouseEvent): void {
        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentDensity = percentage * this.maxDensity;
        this.updateSlider();
        this.updateDensityDisplay();
        this.notifyDensityChange();
    }

    private updateSlider(): void {
        const percentage = (this.currentDensity / this.maxDensity) * 100;
        this.sliderHandle.style.left = `${percentage}%`;
        this.sliderFill.style.width = `${percentage}%`;
    }

    private updateDensityDisplay(): void {
        this.densityDisplay.textContent = this.currentDensity.toFixed(4);
    }

    private notifyDensityChange(): void {
        if (this.onDensityChangeCallback) {
            this.onDensityChangeCallback(this.currentDensity);
        }
    }

    public onDensityChange(callback: (density: number) => void): void {
        this.onDensityChangeCallback = callback;
    }

    public setDensity(density: number): void {
        this.currentDensity = Math.max(0, Math.min(this.maxDensity, density));
        this.updateSlider();
        this.updateDensityDisplay();
    }

    public getDensity(): number {
        return this.currentDensity;
    }
}

