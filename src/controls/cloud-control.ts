/**
 * A UI control with two sliders for adjusting cloud movement speed and coverage amount.
 * Allows users to control how fast clouds move and how much of the sky is covered.
 */
export class CloudControl {
    private sliderContainer: HTMLElement;
    private speedSliderTrack: HTMLElement;
    private speedSliderHandle: HTMLElement;
    private speedSliderFill: HTMLElement;
    private amountSliderTrack: HTMLElement;
    private amountSliderHandle: HTMLElement;
    private amountSliderFill: HTMLElement;

    private speedDisplay: HTMLElement;
    private amountDisplay: HTMLElement;
    private onSpeedChangeCallback?: (speed: number) => void;
    private onAmountChangeCallback?: (amount: number) => void;
    private isDraggingSpeed: boolean = false;
    private isDraggingAmount: boolean = false;
    private currentSpeed: number = 0.2; 
    private currentAmount: number = 0.7;
    private maxSpeed: number = 2.0; 
    private maxAmount: number = 1.0;

    /**
     * Creates a cloud control with speed and amount sliders initialized to default values.
     */
    constructor() {
        this.sliderContainer = document.getElementById('cloud-control-slider') as HTMLElement;
        this.speedSliderTrack = document.getElementById('cloud-speed-track') as HTMLElement;
        this.speedSliderHandle = document.getElementById('cloud-speed-handle') as HTMLElement;
        this.speedSliderFill = document.getElementById('cloud-speed-fill') as HTMLElement;
        this.amountSliderTrack = document.getElementById('cloud-amount-track') as HTMLElement;
        this.amountSliderHandle = document.getElementById('cloud-amount-handle') as HTMLElement;
        this.amountSliderFill = document.getElementById('cloud-amount-fill') as HTMLElement;
        this.speedDisplay = document.getElementById('cloud-speed-display') as HTMLElement;
        this.amountDisplay = document.getElementById('cloud-amount-display') as HTMLElement;

        this.setupEventListeners();
        this.updateSliders();
        this.updateDisplays();
    }

    /**
     * Sets up mouse, touch, and keyboard event handlers for both sliders.
     */
    private setupEventListeners(): void {
        this.speedSliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.speedSliderTrack) {
                this.handleSpeedTrackClick(e);
            }
        });

        this.amountSliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.amountSliderTrack) {
                this.handleAmountTrackClick(e);
            }
        });

        this.speedSliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingSpeed(e);
        });

        this.amountSliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingAmount(e);
        });

        this.speedSliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDraggingSpeed(e.touches[0]);
        });

        this.amountSliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDraggingAmount(e.touches[0]);
        });

        this.sliderContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingSpeed) {
                this.handleSpeedDrag(e);
            } else if (this.isDraggingAmount) {
                this.handleAmountDrag(e);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDraggingSpeed) {
                e.preventDefault();
                this.handleSpeedDrag(e.touches[0]);
            } else if (this.isDraggingAmount) {
                e.preventDefault();
                this.handleAmountDrag(e.touches[0]);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDragging();
        });

        document.addEventListener('touchend', () => {
            this.stopDragging();
        });

        document.addEventListener('click', (e) => {
            const cloudButton = document.getElementById('cloud-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotCloudButton = e.target !== cloudButton;
            
            if (isOutsideSlider && isNotCloudButton && this.isOpen()) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * Makes the cloud control visible with smooth animation.
     */
    public show(): void {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    /**
     * Hides the cloud control with smooth animation.
     */
    public close(): void {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    /**
     * Checks if the cloud control is currently visible.
     * @return True if visible, false if hidden
     */
    public isOpen(): boolean {
        return this.sliderContainer.classList.contains('show');
    }

    /**
     * Begins dragging the speed slider handle.
     * @param e Mouse or touch event
     */
    private startDraggingSpeed(e: MouseEvent | Touch): void {
        this.isDraggingSpeed = true;
        this.speedSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    /**
     * Begins dragging the amount slider handle.
     * @param e Mouse or touch event
     */
    private startDraggingAmount(e: MouseEvent | Touch): void {
        this.isDraggingAmount = true;
        this.amountSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    /**
     * Handles dragging the speed slider to change cloud movement speed.
     * @param e Mouse or touch event with position
     */
    private handleSpeedDrag(e: MouseEvent | Touch): void {
        if (!this.isDraggingSpeed) return;

        const rect = this.speedSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentSpeed = percentage * this.maxSpeed;
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
        this.notifySpeedChange();
    }

    /**
     * Handles dragging the amount slider to change cloud coverage.
     * @param e Mouse or touch event with position
     */
    private handleAmountDrag(e: MouseEvent | Touch): void {
        if (!this.isDraggingAmount) return;

        const rect = this.amountSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentAmount = percentage * this.maxAmount;
        this.updateAmountSlider();
        this.updateAmountDisplay();
        this.notifyAmountChange();
    }

    /**
     * Ends dragging either slider handle.
     */
    private stopDragging(): void {
        this.isDraggingSpeed = false;
        this.isDraggingAmount = false;
        this.speedSliderHandle.style.cursor = 'grab';
        this.amountSliderHandle.style.cursor = 'grab';
    }

    /**
     * Handles clicking on the speed slider track to jump to a specific speed.
     * @param e Mouse event with click position
     */
    private handleSpeedTrackClick(e: MouseEvent): void {
        const rect = this.speedSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentSpeed = percentage * this.maxSpeed;
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
        this.notifySpeedChange();
    }

    /**
     * Handles clicking on the amount slider track to jump to a specific coverage.
     * @param e Mouse event with click position
     */
    private handleAmountTrackClick(e: MouseEvent): void {
        const rect = this.amountSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentAmount = percentage * this.maxAmount;
        this.updateAmountSlider();
        this.updateAmountDisplay();
        this.notifyAmountChange();
    }

    /**
     * Updates the speed slider handle and fill to match current speed.
     */
    private updateSpeedSlider(): void {
        const percentage = (this.currentSpeed / this.maxSpeed) * 100;
        this.speedSliderHandle.style.left = `${percentage}%`;
        this.speedSliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates the amount slider handle and fill to match current cloud coverage.
     */
    private updateAmountSlider(): void {
        const percentage = (this.currentAmount / this.maxAmount) * 100;
        this.amountSliderHandle.style.left = `${percentage}%`;
        this.amountSliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates both slider positions to match current values.
     */
    private updateSliders(): void {
        this.updateSpeedSlider();
        this.updateAmountSlider();
    }

    /**
     * Updates the text display showing current speed value.
     */
    private updateSpeedDisplay(): void {
        this.speedDisplay.textContent = this.currentSpeed.toFixed(2);
    }

    /**
     * Updates the text display showing current cloud coverage percentage.
     */
    private updateAmountDisplay(): void {
        this.amountDisplay.textContent = (this.currentAmount * 100).toFixed(0) + '%';
    }

    /**
     * Updates both text displays to show current values.
     */
    private updateDisplays(): void {
        this.updateSpeedDisplay();
        this.updateAmountDisplay();
    }

    /**
     * Calls the registered speed change callback.
     */
    private notifySpeedChange(): void {
        if (this.onSpeedChangeCallback) {
            this.onSpeedChangeCallback(this.currentSpeed);
        }
    }

    /**
     * Calls the registered amount change callback.
     */
    private notifyAmountChange(): void {
        if (this.onAmountChangeCallback) {
            this.onAmountChangeCallback(this.currentAmount);
        }
    }

    /**
     * Registers a function to be called when cloud speed changes.
     * @param callback Function that receives the new speed value
     */
    public onSpeedChange(callback: (speed: number) => void): void {
        this.onSpeedChangeCallback = callback;
    }

    /**
     * Registers a function to be called when cloud amount changes.
     * @param callback Function that receives the new amount value (0-1)
     */
    public onAmountChange(callback: (amount: number) => void): void {
        this.onAmountChangeCallback = callback;
    }

    /**
     * Sets the cloud movement speed to a specific value.
     * @param speed Movement speed
     */
    public setSpeed(speed: number): void {
        this.currentSpeed = Math.max(0, Math.min(this.maxSpeed, speed));
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
    }

    /**
     * Sets the cloud coverage amount to a specific value.
     * @param amount Coverage amount (0 = clear sky, 1 = fully overcast)
     */
    public setAmount(amount: number): void {
        this.currentAmount = Math.max(0, Math.min(this.maxAmount, amount));
        this.updateAmountSlider();
        this.updateAmountDisplay();
    }

    /**
     * Gets the current cloud movement speed.
     * @return Current speed value
     */
    public getSpeed(): number {
        return this.currentSpeed;
    }

    /**
     * Gets the current cloud coverage amount.
     * @return Current amount value (0-1)
     */
    public getAmount(): number {
        return this.currentAmount;
    }
}

