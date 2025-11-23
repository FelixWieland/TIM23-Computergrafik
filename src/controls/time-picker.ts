/**
 * A UI control for selecting the time of day with a draggable slider.
 * Changes the sun position and time displayed in the scene.
 */
export class TimePicker {
    private sliderContainer: HTMLElement;
    private sliderTrack: HTMLElement;
    private sliderHandle: HTMLElement;
    private sliderFill: HTMLElement;
    private timeIcon: HTMLElement;
    private timeDisplay: HTMLElement;
    private onTimeChangeCallback?: (time: number) => void;
    private isDragging: boolean = false;
    private currentTime: number = 12;

    /**
     * Creates a time picker UI and initializes it to the current real time.
     */
    constructor() {
        this.sliderContainer = document.getElementById('time-picker-slider') as HTMLElement;
        this.sliderTrack = this.sliderContainer.querySelector('.time-slider-track') as HTMLElement;
        this.sliderHandle = document.getElementById('time-slider-handle') as HTMLElement;
        this.sliderFill = this.sliderContainer.querySelector('.time-slider-fill') as HTMLElement;
        this.timeIcon = document.getElementById('time-icon') as HTMLElement;
        this.timeDisplay = document.getElementById('current-time-display') as HTMLElement;

        this.setupEventListeners();
        this.initializeWithCurrentTime();
    }

    /**
     * Sets up all mouse, touch, and keyboard event handlers for the time picker.
     */
    private setupEventListeners(): void {
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
            const timePickerButton = document.getElementById('time-picker');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotTimePickerButton = e.target !== timePickerButton;
            if (isOutsideSlider && isNotTimePickerButton && this.isOpen()) {
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
     * Sets the time picker to show the current real-world time.
     */
    private initializeWithCurrentTime(): void {
        const now = new Date();
        this.currentTime = now.getHours() + now.getMinutes() / 60;
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
    }

    /**
     * Makes the time picker visible with a smooth animation.
     */
    public show(): void {
        this.sliderContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.sliderContainer.classList.add('show');
        });
    }

    /**
     * Hides the time picker with a smooth animation.
     */
    public close(): void {
        this.sliderContainer.classList.remove('show');
        setTimeout(() => {
            this.sliderContainer.style.display = 'none';
        }, 300);
    }

    /**
     * Checks if the time picker is currently visible.
     * @return True if visible, false if hidden
     */
    public isOpen(): boolean {
        return this.sliderContainer.classList.contains('show');
    }

    /**
     * Begins dragging the time slider handle.
     * @param e Mouse or touch event
     */
    private startDragging(e: MouseEvent | Touch): void {
        this.isDragging = true;
        this.sliderHandle.style.cursor = 'grabbing';
        if ('preventDefault' in e) {
            e.preventDefault();
        }
    }

    /**
     * Handles dragging the slider handle to change the time.
     * @param e Mouse or touch event with position
     */
    private handleDrag(e: MouseEvent | Touch): void {
        if (!this.isDragging) return;

        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentTime = percentage * 24;
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
        this.notifyTimeChange();
    }

    /**
     * Ends dragging the slider handle.
     */
    private stopDragging(): void {
        this.isDragging = false;
        this.sliderHandle.style.cursor = 'grab';
    }

    /**
     * Handles clicking on the slider track to jump to a specific time.
     * @param e Mouse event with click position
     */
    private handleTrackClick(e: MouseEvent): void {
        const rect = this.sliderTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.currentTime = percentage * 24;
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
        this.notifyTimeChange();
    }

    /**
     * Updates the slider handle and fill to match the current time.
     */
    private updateSlider(): void {
        const percentage = (this.currentTime / 24) * 100;
        this.sliderHandle.style.left = `${percentage}%`;
        this.sliderFill.style.width = `${percentage}%`;
    }

    /**
     * Updates the text display showing the current time in HH:MM format.
     */
    private updateTimeDisplay(): void {
        const hours = Math.floor(this.currentTime);
        const minutes = Math.floor((this.currentTime - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        this.timeDisplay.textContent = timeString;
    }

    /**
     * Changes the icon to show a sun (daytime) or moon (nighttime) based on the selected time.
     */
    private updateIcon(): void {
        const isDay = this.currentTime >= 6 && this.currentTime < 18;
        
        this.timeIcon.classList.remove('sun', 'moon');
        
        if (isDay) {
            this.timeIcon.classList.add('sun');
            this.timeIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
            `;
        } else {
            this.timeIcon.classList.add('moon');
            this.timeIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    }

    /**
     * Calls the registered callback when time changes.
     */
    private notifyTimeChange(): void {
        if (this.onTimeChangeCallback) {
            this.onTimeChangeCallback(this.currentTime);
        }
    }

    /**
     * Registers a function to be called when the time is changed.
     * @param callback Function that receives the new time (0-24 hours)
     */
    public onTimeChange(callback: (time: number) => void): void {
        this.onTimeChangeCallback = callback;
    }

    /**
     * Sets the time picker to a specific time.
     * @param time Time in hours (0-24)
     */
    public setTime(time: number): void {
        this.currentTime = Math.max(0, Math.min(24, time));
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
    }

    /**
     * Gets the currently selected time.
     * @return Time in hours (0-24)
     */
    public getTime(): number {
        return this.currentTime;
    }
}


