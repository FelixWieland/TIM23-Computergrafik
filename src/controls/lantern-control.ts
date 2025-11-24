export class LanternControl {
    private sliderContainer: HTMLElement;
    private warmthSliderTrack: HTMLElement;
    private warmthSliderHandle: HTMLElement;
    private warmthSliderFill: HTMLElement;
    private intensitySliderTrack: HTMLElement;
    private intensitySliderHandle: HTMLElement;
    private intensitySliderFill: HTMLElement;
    private warmthDisplay: HTMLElement;
    private intensityDisplay: HTMLElement;
    private enableCheckbox: HTMLInputElement;
    private debugLightingCheckbox: HTMLInputElement;
    private onWarmthChangeCallback?: (warmth: number) => void;
    private onIntensityChangeCallback?: (intensity: number) => void;
    private onEnableChangeCallback?: (enabled: boolean) => void;
    private onDebugLightingChangeCallback?: (enabled: boolean) => void;
    private isDraggingWarmth: boolean = false;
    private isDraggingIntensity: boolean = false;
    private currentWarmth: number = 0.6;
    private currentIntensity: number = 30.0;
    private isEnabled: boolean = true;
    private isDebugLightingEnabled: boolean = false;
    private maxWarmth: number = 1.0;
    private maxIntensity: number = 50.0;

    constructor() {
        this.sliderContainer = document.getElementById('lantern-control-slider') as HTMLElement;
        this.warmthSliderTrack = document.getElementById('lantern-warmth-track') as HTMLElement;
        this.warmthSliderHandle = document.getElementById('lantern-warmth-handle') as HTMLElement;
        this.warmthSliderFill = document.getElementById('lantern-warmth-fill') as HTMLElement;
        this.intensitySliderTrack = document.getElementById('lantern-intensity-track') as HTMLElement;
        this.intensitySliderHandle = document.getElementById('lantern-intensity-handle') as HTMLElement;
        this.intensitySliderFill = document.getElementById('lantern-intensity-fill') as HTMLElement;
        this.warmthDisplay = document.getElementById('lantern-warmth-display') as HTMLElement;
        this.intensityDisplay = document.getElementById('lantern-intensity-display') as HTMLElement;
        this.enableCheckbox = document.getElementById('lantern-enable-checkbox') as HTMLInputElement;
        this.debugLightingCheckbox = document.getElementById('lantern-debug-lighting-checkbox') as HTMLInputElement;

        this.setupEventListeners();
        this.updateSliders();
        this.updateDisplays();
        this.updateCheckbox();
        this.updateDebugLightingCheckbox();
    }

    private setupEventListeners(): void {
        this.warmthSliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.warmthSliderTrack) {
                this.handleWarmthTrackClick(e);
            }
        });

        this.intensitySliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.intensitySliderTrack) {
                this.handleIntensityTrackClick(e);
            }
        });

        this.warmthSliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingWarmth(e);
        });

        this.intensitySliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingIntensity(e);
        });

        this.warmthSliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDraggingWarmth(e.touches[0]);
        });

        this.intensitySliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDraggingIntensity(e.touches[0]);
        });

        this.sliderContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingWarmth) {
                this.handleWarmthDrag(e);
            } else if (this.isDraggingIntensity) {
                this.handleIntensityDrag(e);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDraggingWarmth) {
                e.preventDefault();
                this.handleWarmthDrag(e.touches[0]);
            } else if (this.isDraggingIntensity) {
                e.preventDefault();
                this.handleIntensityDrag(e.touches[0]);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDragging();
        });

        document.addEventListener('touchend', () => {
            this.stopDragging();
        });

        this.enableCheckbox.addEventListener('change', (e) => {
            this.isEnabled = (e.target as HTMLInputElement).checked;
            this.notifyEnableChange();
        });

        this.debugLightingCheckbox.addEventListener('change', (e) => {
            this.isDebugLightingEnabled = (e.target as HTMLInputElement).checked;
            this.notifyDebugLightingChange();
        });

        document.addEventListener('click', (e) => {
            const lanternButton = document.getElementById('lantern-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotLanternButton = e.target !== lanternButton;
            
            if (isOutsideSlider && isNotLanternButton && this.isOpen()) {
                this.close();
            }
        });

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

    private startDraggingWarmth(e: MouseEvent | Touch): void {
        this.isDraggingWarmth = true;
        this.warmthSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    private startDraggingIntensity(e: MouseEvent | Touch): void {
        this.isDraggingIntensity = true;
        this.intensitySliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    private handleWarmthDrag(e: MouseEvent | Touch): void {
        if (!this.isDraggingWarmth) return;

        const rect = this.warmthSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentWarmth = percentage * this.maxWarmth;
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
        this.notifyWarmthChange();
    }

    private handleIntensityDrag(e: MouseEvent | Touch): void {
        if (!this.isDraggingIntensity) return;

        const rect = this.intensitySliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentIntensity = percentage * this.maxIntensity;
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
        this.notifyIntensityChange();
    }

    private stopDragging(): void {
        this.isDraggingWarmth = false;
        this.isDraggingIntensity = false;
        this.warmthSliderHandle.style.cursor = 'grab';
        this.intensitySliderHandle.style.cursor = 'grab';
    }

    private handleWarmthTrackClick(e: MouseEvent): void {
        const rect = this.warmthSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentWarmth = percentage * this.maxWarmth;
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
        this.notifyWarmthChange();
    }

    private handleIntensityTrackClick(e: MouseEvent): void {
        const rect = this.intensitySliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentIntensity = percentage * this.maxIntensity;
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
        this.notifyIntensityChange();
    }

    private updateWarmthSlider(): void {
        const percentage = (this.currentWarmth / this.maxWarmth) * 100;
        this.warmthSliderHandle.style.left = `${percentage}%`;
        this.warmthSliderFill.style.width = `${percentage}%`;
    }

    private updateIntensitySlider(): void {
        const percentage = (this.currentIntensity / this.maxIntensity) * 100;
        this.intensitySliderHandle.style.left = `${percentage}%`;
        this.intensitySliderFill.style.width = `${percentage}%`;
    }

    private updateSliders(): void {
        this.updateWarmthSlider();
        this.updateIntensitySlider();
    }

    private updateWarmthDisplay(): void {
        this.warmthDisplay.textContent = (this.currentWarmth * 100).toFixed(0) + '%';
    }

    private updateIntensityDisplay(): void {
        this.intensityDisplay.textContent = this.currentIntensity.toFixed(1);
    }

    private updateDisplays(): void {
        this.updateWarmthDisplay();
        this.updateIntensityDisplay();
    }

    private updateCheckbox(): void {
        this.enableCheckbox.checked = this.isEnabled;
    }

    private updateDebugLightingCheckbox(): void {
        this.debugLightingCheckbox.checked = this.isDebugLightingEnabled;
    }

    private notifyWarmthChange(): void {
        if (this.onWarmthChangeCallback) {
            this.onWarmthChangeCallback(this.currentWarmth);
        }
    }

    private notifyIntensityChange(): void {
        if (this.onIntensityChangeCallback) {
            this.onIntensityChangeCallback(this.currentIntensity);
        }
    }

    private notifyEnableChange(): void {
        if (this.onEnableChangeCallback) {
            this.onEnableChangeCallback(this.isEnabled);
        }
    }

    private notifyDebugLightingChange(): void {
        if (this.onDebugLightingChangeCallback) {
            this.onDebugLightingChangeCallback(this.isDebugLightingEnabled);
        }
    }

    public onWarmthChange(callback: (warmth: number) => void): void {
        this.onWarmthChangeCallback = callback;
    }

    public onIntensityChange(callback: (intensity: number) => void): void {
        this.onIntensityChangeCallback = callback;
    }

    public onEnableChange(callback: (enabled: boolean) => void): void {
        this.onEnableChangeCallback = callback;
    }

    public onDebugLightingChange(callback: (enabled: boolean) => void): void {
        this.onDebugLightingChangeCallback = callback;
    }

    public setWarmth(warmth: number): void {
        this.currentWarmth = Math.max(0, Math.min(this.maxWarmth, warmth));
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
    }

    public setIntensity(intensity: number): void {
        this.currentIntensity = Math.max(0, Math.min(this.maxIntensity, intensity));
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
    }

    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        this.updateCheckbox();
        this.notifyEnableChange();
    }

    public getWarmth(): number {
        return this.currentWarmth;
    }

    public getIntensity(): number {
        return this.currentIntensity;
    }

    public getEnabled(): boolean {
        return this.isEnabled;
    }

    public setDebugLighting(enabled: boolean): void {
        this.isDebugLightingEnabled = enabled;
        this.updateDebugLightingCheckbox();
        this.notifyDebugLightingChange();
    }

    public getDebugLighting(): boolean {
        return this.isDebugLightingEnabled;
    }
}

