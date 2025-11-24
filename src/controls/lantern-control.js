export class LanternControl {
    sliderContainer;
    warmthSliderTrack;
    warmthSliderHandle;
    warmthSliderFill;
    intensitySliderTrack;
    intensitySliderHandle;
    intensitySliderFill;
    warmthDisplay;
    intensityDisplay;
    enableCheckbox;
    debugLightingCheckbox;
    onWarmthChangeCallback;
    onIntensityChangeCallback;
    onEnableChangeCallback;
    onDebugLightingChangeCallback;
    isDraggingWarmth = false;
    isDraggingIntensity = false;
    currentWarmth = 0.6;
    currentIntensity = 30.0;
    isEnabled = true;
    isDebugLightingEnabled = false;
    maxWarmth = 1.0;
    maxIntensity = 50.0;

    constructor() {
        this.sliderContainer = document.getElementById('lantern-control-slider');
        this.warmthSliderTrack = document.getElementById('lantern-warmth-track');
        this.warmthSliderHandle = document.getElementById('lantern-warmth-handle');
        this.warmthSliderFill = document.getElementById('lantern-warmth-fill');
        this.intensitySliderTrack = document.getElementById('lantern-intensity-track');
        this.intensitySliderHandle = document.getElementById('lantern-intensity-handle');
        this.intensitySliderFill = document.getElementById('lantern-intensity-fill');
        this.warmthDisplay = document.getElementById('lantern-warmth-display');
        this.intensityDisplay = document.getElementById('lantern-intensity-display');
        this.enableCheckbox = document.getElementById('lantern-enable-checkbox');
        this.debugLightingCheckbox = document.getElementById('lantern-debug-lighting-checkbox');
        this.setupEventListeners();
        this.updateSliders();
        this.updateDisplays();
        this.updateCheckbox();
        this.updateDebugLightingCheckbox();
    }

    setupEventListeners() {
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
            }
            else if (this.isDraggingIntensity) {
                this.handleIntensityDrag(e);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (this.isDraggingWarmth) {
                e.preventDefault();
                this.handleWarmthDrag(e.touches[0]);
            }
            else if (this.isDraggingIntensity) {
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
            this.isEnabled = e.target.checked;
            this.notifyEnableChange();
        });
        this.debugLightingCheckbox.addEventListener('change', (e) => {
            this.isDebugLightingEnabled = e.target.checked;
            this.notifyDebugLightingChange();
        });
        document.addEventListener('click', (e) => {
            const lanternButton = document.getElementById('lantern-control');
            const isOutsideSlider = !this.sliderContainer.contains(e.target);
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

    show() {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    close() {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    isOpen() {
        return this.sliderContainer.classList.contains('show');
    }

    startDraggingWarmth(e) {
        this.isDraggingWarmth = true;
        this.warmthSliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    startDraggingIntensity(e) {
        this.isDraggingIntensity = true;
        this.intensitySliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    handleWarmthDrag(e) {
        if (!this.isDraggingWarmth)
            return;
        const rect = this.warmthSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentWarmth = percentage * this.maxWarmth;
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
        this.notifyWarmthChange();
    }

    handleIntensityDrag(e) {
        if (!this.isDraggingIntensity)
            return;
        const rect = this.intensitySliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentIntensity = percentage * this.maxIntensity;
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
        this.notifyIntensityChange();
    }

    stopDragging() {
        this.isDraggingWarmth = false;
        this.isDraggingIntensity = false;
        this.warmthSliderHandle.style.cursor = 'grab';
        this.intensitySliderHandle.style.cursor = 'grab';
    }

    handleWarmthTrackClick(e) {
        const rect = this.warmthSliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentWarmth = percentage * this.maxWarmth;
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
        this.notifyWarmthChange();
    }

    handleIntensityTrackClick(e) {
        const rect = this.intensitySliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        this.currentIntensity = percentage * this.maxIntensity;
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
        this.notifyIntensityChange();
    }

    updateWarmthSlider() {
        const percentage = (this.currentWarmth / this.maxWarmth) * 100;
        this.warmthSliderHandle.style.left = `${percentage}%`;
        this.warmthSliderFill.style.width = `${percentage}%`;
    }

    updateIntensitySlider() {
        const percentage = (this.currentIntensity / this.maxIntensity) * 100;
        this.intensitySliderHandle.style.left = `${percentage}%`;
        this.intensitySliderFill.style.width = `${percentage}%`;
    }

    updateSliders() {
        this.updateWarmthSlider();
        this.updateIntensitySlider();
    }

    updateWarmthDisplay() {
        this.warmthDisplay.textContent = (this.currentWarmth * 100).toFixed(0) + '%';
    }

    updateIntensityDisplay() {
        this.intensityDisplay.textContent = this.currentIntensity.toFixed(1);
    }

    updateDisplays() {
        this.updateWarmthDisplay();
        this.updateIntensityDisplay();
    }

    updateCheckbox() {
        this.enableCheckbox.checked = this.isEnabled;
    }

    updateDebugLightingCheckbox() {
        this.debugLightingCheckbox.checked = this.isDebugLightingEnabled;
    }

    notifyWarmthChange() {
        if (this.onWarmthChangeCallback) {
            this.onWarmthChangeCallback(this.currentWarmth);
        }
    }

    notifyIntensityChange() {
        if (this.onIntensityChangeCallback) {
            this.onIntensityChangeCallback(this.currentIntensity);
        }
    }

    notifyEnableChange() {
        if (this.onEnableChangeCallback) {
            this.onEnableChangeCallback(this.isEnabled);
        }
    }

    notifyDebugLightingChange() {
        if (this.onDebugLightingChangeCallback) {
            this.onDebugLightingChangeCallback(this.isDebugLightingEnabled);
        }
    }

    onWarmthChange(callback) {
        this.onWarmthChangeCallback = callback;
    }

    onIntensityChange(callback) {
        this.onIntensityChangeCallback = callback;
    }

    onEnableChange(callback) {
        this.onEnableChangeCallback = callback;
    }

    onDebugLightingChange(callback) {
        this.onDebugLightingChangeCallback = callback;
    }

    setWarmth(warmth) {
        this.currentWarmth = Math.max(0, Math.min(this.maxWarmth, warmth));
        this.updateWarmthSlider();
        this.updateWarmthDisplay();
    }

    setIntensity(intensity) {
        this.currentIntensity = Math.max(0, Math.min(this.maxIntensity, intensity));
        this.updateIntensitySlider();
        this.updateIntensityDisplay();
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.updateCheckbox();
        this.notifyEnableChange();
    }

    getWarmth() {
        return this.currentWarmth;
    }

    getIntensity() {
        return this.currentIntensity;
    }

    getEnabled() {
        return this.isEnabled;
    }

    setDebugLighting(enabled) {
        this.isDebugLightingEnabled = enabled;
        this.updateDebugLightingCheckbox();
        this.notifyDebugLightingChange();
    }
    
    getDebugLighting() {
        return this.isDebugLightingEnabled;
    }
}
