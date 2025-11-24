/**
 * A UI control for adjusting fog density with a draggable slider.
 * Allows users to control how thick the atmospheric fog appears.
 */
export class FogSlider {
    sliderContainer;
    sliderTrack;
    sliderHandle;
    sliderFill;
    densityDisplay;
    onDensityChangeCallback;
    isDragging = false;
    currentDensity = 0.0;
    maxDensity = 0.01;

    /**
     * Creates a fog density slider and initializes it to zero fog.
     */
    constructor() {
        this.sliderContainer = document.getElementById('fog-slider');
        this.sliderTrack = this.sliderContainer.querySelector('.time-slider-track');
        this.sliderHandle = document.getElementById('fog-slider-handle');
        this.sliderFill = this.sliderContainer.querySelector('.time-slider-fill');
        this.densityDisplay = document.getElementById('fog-density-display');
        this.setupEventListeners();
        this.updateSlider();
        this.updateDensityDisplay();
    }

    /**
     * Sets up mouse, touch, and keyboard event handlers for the slider.
     */
    setupEventListeners() {
        this.sliderTrack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === this.sliderTrack) {
                this.handleTrackClick(e);
            }
        });
        this.sliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDragging(e);
        });
        this.sliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDragging(e.touches[0]);
        });
        this.sliderContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
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
        document.addEventListener('click', (e) => {
            const fogButton = document.getElementById('fog-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target);
            const isNotFogButton = e.target !== fogButton;
            if (isOutsideSlider && isNotFogButton && this.isOpen()) {
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
     * Makes the fog slider visible with smooth animation.
     */
    show() {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    /**
     * Hides the fog slider with smooth animation.
     */
    close() {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    /**
     * Checks if the fog slider is currently visible.
     * @return True if visible, false if hidden
     */
    isOpen() {
        return this.sliderContainer.classList.contains('show');
    }

    /**
     * Begins dragging the slider handle.
     * @param e Mouse or touch event
     */
    startDragging(e) {
        this.isDragging = true;
        this.sliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    /**
     * Handles dragging the slider to change fog density.
     * @param e Mouse or touch event with position
     */
    handleDrag(e) {
        if (!this.isDragging)
            return;
        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentDensity = percentage * this.maxDensity;
        this.updateSlider();
        this.updateDensityDisplay();
        this.notifyDensityChange();
    }

    /**
     * Ends dragging the slider handle.
     */
    stopDragging() {
        this.isDragging = false;
        this.sliderHandle.style.cursor = 'grab';
    }

    /**
     * Handles clicking on the slider track to jump to a specific density.
     * @param e Mouse event with click position
     */
    handleTrackClick(e) {
        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentDensity = percentage * this.maxDensity;
        this.updateSlider();
        this.updateDensityDisplay();
        this.notifyDensityChange();
    }

    /**
     * Updates the slider handle and fill to match current density.
     */
    updateSlider() {
        const percentage = (this.currentDensity / this.maxDensity) * 100;
        this.sliderHandle.style.left = `${percentage}%`;
        this.sliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates the text display showing current fog density value.
     */
    updateDensityDisplay() {
        this.densityDisplay.textContent = this.currentDensity.toFixed(4);
    }

    /**
     * Calls the registered callback when density changes.
     */
    notifyDensityChange() {
        if (this.onDensityChangeCallback) {
            this.onDensityChangeCallback(this.currentDensity);
        }
    }

    /**
     * Registers a function to be called when fog density changes.
     * @param callback Function that receives the new density value
     */
    onDensityChange(callback) {
        this.onDensityChangeCallback = callback;
    }

    /**
     * Sets the fog density to a specific value.
     * @param density Fog density (0 = no fog, higher = thicker fog)
     */
    setDensity(density) {
        this.currentDensity = Math.max(0, Math.min(this.maxDensity, density));
        this.updateSlider();
        this.updateDensityDisplay();
    }
    
    /**
     * Gets the current fog density value.
     * @return Current fog density
     */
    getDensity() {
        return this.currentDensity;
    }
}
