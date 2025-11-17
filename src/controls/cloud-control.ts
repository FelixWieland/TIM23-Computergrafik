export class CloudControl {
    private sliderContainer: HTMLElement;
    private speedSliderTrack: HTMLElement;
    private speedSliderHandle: HTMLElement;
    private speedSliderFill: HTMLElement;
    private amountSliderTrack: HTMLElement;
    private amountSliderHandle: HTMLElement;
    private amountSliderFill: HTMLElement;
    private cloudIcon: HTMLElement;
    private speedDisplay: HTMLElement;
    private amountDisplay: HTMLElement;
    private onSpeedChangeCallback?: (speed: number) => void;
    private onAmountChangeCallback?: (amount: number) => void;
    private isDraggingSpeed: boolean = false;
    private isDraggingAmount: boolean = false;
    private currentSpeed: number = 0.2; // Default movement speed
    private currentAmount: number = 0.7; // Default cloud amount (coverage)
    private maxSpeed: number = 2.0; // Maximum movement speed
    private maxAmount: number = 1.0; // Maximum cloud amount

    constructor() {
        this.sliderContainer = document.getElementById('cloud-control-slider') as HTMLElement;
        this.speedSliderTrack = document.getElementById('cloud-speed-track') as HTMLElement;
        this.speedSliderHandle = document.getElementById('cloud-speed-handle') as HTMLElement;
        this.speedSliderFill = document.getElementById('cloud-speed-fill') as HTMLElement;
        this.amountSliderTrack = document.getElementById('cloud-amount-track') as HTMLElement;
        this.amountSliderHandle = document.getElementById('cloud-amount-handle') as HTMLElement;
        this.amountSliderFill = document.getElementById('cloud-amount-fill') as HTMLElement;
        this.cloudIcon = document.getElementById('cloud-icon') as HTMLElement;
        this.speedDisplay = document.getElementById('cloud-speed-display') as HTMLElement;
        this.amountDisplay = document.getElementById('cloud-amount-display') as HTMLElement;

        this.setupEventListeners();
        this.updateSliders();
        this.updateDisplays();
    }

    private setupEventListeners(): void {
        // Speed slider track clicks
        this.speedSliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.speedSliderTrack) {
                this.handleSpeedTrackClick(e);
            }
        });

        // Amount slider track clicks
        this.amountSliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.amountSliderTrack) {
                this.handleAmountTrackClick(e);
            }
        });

        // Speed handle dragging
        this.speedSliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingSpeed(e);
        });

        // Amount handle dragging
        this.amountSliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingAmount(e);
        });

        // Touch events for mobile
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

        // Prevent clicks inside the slider container from closing it
        this.sliderContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Global mouse/touch events for dragging
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

        // Close slider when clicking outside
        document.addEventListener('click', (e) => {
            const cloudButton = document.getElementById('cloud-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotCloudButton = e.target !== cloudButton;
            
            if (isOutsideSlider && isNotCloudButton && this.isOpen()) {
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

    private startDraggingSpeed(e: MouseEvent | Touch): void {
        this.isDraggingSpeed = true;
        this.speedSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    private startDraggingAmount(e: MouseEvent | Touch): void {
        this.isDraggingAmount = true;
        this.amountSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

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

    private stopDragging(): void {
        this.isDraggingSpeed = false;
        this.isDraggingAmount = false;
        this.speedSliderHandle.style.cursor = 'grab';
        this.amountSliderHandle.style.cursor = 'grab';
    }

    private handleSpeedTrackClick(e: MouseEvent): void {
        const rect = this.speedSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentSpeed = percentage * this.maxSpeed;
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
        this.notifySpeedChange();
    }

    private handleAmountTrackClick(e: MouseEvent): void {
        const rect = this.amountSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentAmount = percentage * this.maxAmount;
        this.updateAmountSlider();
        this.updateAmountDisplay();
        this.notifyAmountChange();
    }

    private updateSpeedSlider(): void {
        const percentage = (this.currentSpeed / this.maxSpeed) * 100;
        this.speedSliderHandle.style.left = `${percentage}%`;
        this.speedSliderFill.style.width = `${percentage}%`;
    }

    private updateAmountSlider(): void {
        const percentage = (this.currentAmount / this.maxAmount) * 100;
        this.amountSliderHandle.style.left = `${percentage}%`;
        this.amountSliderFill.style.width = `${percentage}%`;
    }

    private updateSliders(): void {
        this.updateSpeedSlider();
        this.updateAmountSlider();
    }

    private updateSpeedDisplay(): void {
        this.speedDisplay.textContent = this.currentSpeed.toFixed(2);
    }

    private updateAmountDisplay(): void {
        this.amountDisplay.textContent = (this.currentAmount * 100).toFixed(0) + '%';
    }

    private updateDisplays(): void {
        this.updateSpeedDisplay();
        this.updateAmountDisplay();
    }

    private notifySpeedChange(): void {
        if (this.onSpeedChangeCallback) {
            this.onSpeedChangeCallback(this.currentSpeed);
        }
    }

    private notifyAmountChange(): void {
        if (this.onAmountChangeCallback) {
            this.onAmountChangeCallback(this.currentAmount);
        }
    }

    public onSpeedChange(callback: (speed: number) => void): void {
        this.onSpeedChangeCallback = callback;
    }

    public onAmountChange(callback: (amount: number) => void): void {
        this.onAmountChangeCallback = callback;
    }

    public setSpeed(speed: number): void {
        this.currentSpeed = Math.max(0, Math.min(this.maxSpeed, speed));
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
    }

    public setAmount(amount: number): void {
        this.currentAmount = Math.max(0, Math.min(this.maxAmount, amount));
        this.updateAmountSlider();
        this.updateAmountDisplay();
    }

    public getSpeed(): number {
        return this.currentSpeed;
    }

    public getAmount(): number {
        return this.currentAmount;
    }
}

