/**
 * A UI control with two sliders for adjusting cloud movement speed and coverage amount.
 * Allows users to control how fast clouds move and how much of the sky is covered.
 */
export class CloudControl {
    sliderContainer;
    speedSliderTrack;
    speedSliderHandle;
    speedSliderFill;
    amountSliderTrack;
    amountSliderHandle;
    amountSliderFill;
    speedDisplay;
    amountDisplay;
    onSpeedChangeCallback;
    onAmountChangeCallback;
    isDraggingSpeed = false;
    isDraggingAmount = false;
    currentSpeed = 0.2;
    currentAmount = 0.7;
    maxSpeed = 2.0;
    maxAmount = 1.0;

    /**
     * Creates a cloud control with speed and amount sliders initialized to default values.
     */
    constructor() {
        this.sliderContainer = document.getElementById('cloud-control-slider');
        this.speedSliderTrack = document.getElementById('cloud-speed-track');
        this.speedSliderHandle = document.getElementById('cloud-speed-handle');
        this.speedSliderFill = document.getElementById('cloud-speed-fill');
        this.amountSliderTrack = document.getElementById('cloud-amount-track');
        this.amountSliderHandle = document.getElementById('cloud-amount-handle');
        this.amountSliderFill = document.getElementById('cloud-amount-fill');
        this.speedDisplay = document.getElementById('cloud-speed-display');
        this.amountDisplay = document.getElementById('cloud-amount-display');
        this.setupEventListeners();
        this.updateSliders();
        this.updateDisplays();
    }

    /**
     * Sets up mouse, touch, and keyboard event handlers for both sliders.
     */
    setupEventListeners() {
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
            }
            else if (this.isDraggingAmount) {
                this.handleAmountDrag(e);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (this.isDraggingSpeed) {
                e.preventDefault();
                this.handleSpeedDrag(e.touches[0]);
            }
            else if (this.isDraggingAmount) {
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
            const isOutsideSlider = !this.sliderContainer.contains(e.target);
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
    show() {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    /**
     * Hides the cloud control with smooth animation.
     */
    close() {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    /**
     * Checks if the cloud control is currently visible.
     * @return True if visible, false if hidden
     */
    isOpen() {
        return this.sliderContainer.classList.contains('show');
    }

    /**
     * Begins dragging the speed slider handle.
     * @param e Mouse or touch event
     */
    startDraggingSpeed(e) {
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
    startDraggingAmount(e) {
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
    handleSpeedDrag(e) {
        if (!this.isDraggingSpeed)
            return;
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
    handleAmountDrag(e) {
        if (!this.isDraggingAmount)
            return;
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
    stopDragging() {
        this.isDraggingSpeed = false;
        this.isDraggingAmount = false;
        this.speedSliderHandle.style.cursor = 'grab';
        this.amountSliderHandle.style.cursor = 'grab';
    }

    /**
     * Handles clicking on the speed slider track to jump to a specific speed.
     * @param e Mouse event with click position
     */
    handleSpeedTrackClick(e) {
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
    handleAmountTrackClick(e) {
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
    updateSpeedSlider() {
        const percentage = (this.currentSpeed / this.maxSpeed) * 100;
        this.speedSliderHandle.style.left = `${percentage}%`;
        this.speedSliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates the amount slider handle and fill to match current cloud coverage.
     */
    updateAmountSlider() {
        const percentage = (this.currentAmount / this.maxAmount) * 100;
        this.amountSliderHandle.style.left = `${percentage}%`;
        this.amountSliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates both slider positions to match current values.
     */
    updateSliders() {
        this.updateSpeedSlider();
        this.updateAmountSlider();
    }

    /**
     * Updates the text display showing current speed value.
     */
    updateSpeedDisplay() {
        this.speedDisplay.textContent = this.currentSpeed.toFixed(2);
    }

    /**
     * Updates the text display showing current cloud coverage percentage.
     */
    updateAmountDisplay() {
        this.amountDisplay.textContent = (this.currentAmount * 100).toFixed(0) + '%';
    }

    /**
     * Updates both text displays to show current values.
     */
    updateDisplays() {
        this.updateSpeedDisplay();
        this.updateAmountDisplay();
    }

    /**
     * Calls the registered speed change callback.
     */
    notifySpeedChange() {
        if (this.onSpeedChangeCallback) {
            this.onSpeedChangeCallback(this.currentSpeed);
        }
    }

    /**
     * Calls the registered amount change callback.
     */
    notifyAmountChange() {
        if (this.onAmountChangeCallback) {
            this.onAmountChangeCallback(this.currentAmount);
        }
    }

    /**
     * Registers a function to be called when cloud speed changes.
     * @param callback Function that receives the new speed value
     */
    onSpeedChange(callback) {
        this.onSpeedChangeCallback = callback;
    }

    /**
     * Registers a function to be called when cloud amount changes.
     * @param callback Function that receives the new amount value (0-1)
     */
    onAmountChange(callback) {
        this.onAmountChangeCallback = callback;
    }

    /**
     * Sets the cloud movement speed to a specific value.
     * @param speed Movement speed
     */
    setSpeed(speed) {
        this.currentSpeed = Math.max(0, Math.min(this.maxSpeed, speed));
        this.updateSpeedSlider();
        this.updateSpeedDisplay();
    }

    /**
     * Sets the cloud coverage amount to a specific value.
     * @param amount Coverage amount (0 = clear sky, 1 = fully overcast)
     */
    setAmount(amount) {
        this.currentAmount = Math.max(0, Math.min(this.maxAmount, amount));
        this.updateAmountSlider();
        this.updateAmountDisplay();
    }

    /**
     * Gets the current cloud movement speed.
     * @return Current speed value
     */
    getSpeed() {
        return this.currentSpeed;
    }
    
    /**
     * Gets the current cloud coverage amount.
     * @return Current amount value (0-1)
     */
    getAmount() {
        return this.currentAmount;
    }
}
