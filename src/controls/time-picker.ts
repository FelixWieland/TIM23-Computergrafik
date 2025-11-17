export class TimePicker {
    private sliderContainer: HTMLElement;
    private sliderTrack: HTMLElement;
    private sliderHandle: HTMLElement;
    private sliderFill: HTMLElement;
    private timeIcon: HTMLElement;
    private timeDisplay: HTMLElement;
    private onTimeChangeCallback?: (time: number) => void;
    private isDragging: boolean = false;
    private currentTime: number = 12; // Default to noon (12:00)

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

    private setupEventListeners(): void {
        // Handle slider track clicks
        this.sliderTrack.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            if (e.target === this.sliderTrack) {
                this.handleTrackClick(e);
            }
        });

        // Handle handle dragging
        this.sliderHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.startDragging(e);
        });

        // Handle touch events for mobile
        this.sliderHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
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
            // Check if the click is outside the slider container and not on the time picker button
            const timePickerButton = document.getElementById('time-picker');
            const isOutsideSlider = !this.sliderContainer.contains(e.target as Node);
            const isNotTimePickerButton = e.target !== timePickerButton;
            
            if (isOutsideSlider && isNotTimePickerButton && this.isOpen()) {
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

    private initializeWithCurrentTime(): void {
        const now = new Date();
        this.currentTime = now.getHours() + now.getMinutes() / 60;
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
    }

    public show(): void {
        this.sliderContainer.style.display = 'block';
        // Use requestAnimationFrame to ensure the element is rendered before adding the show class
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
        
        this.currentTime = percentage * 24; // 0 to 24 hours
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
        this.notifyTimeChange();
    }

    private stopDragging(): void {
        this.isDragging = false;
        this.sliderHandle.style.cursor = 'grab';
    }

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

    private updateSlider(): void {
        const percentage = (this.currentTime / 24) * 100;
        this.sliderHandle.style.left = `${percentage}%`;
        this.sliderFill.style.width = `${percentage}%`;
    }

    private updateTimeDisplay(): void {
        const hours = Math.floor(this.currentTime);
        const minutes = Math.floor((this.currentTime - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        this.timeDisplay.textContent = timeString;
    }

    private updateIcon(): void {
        // Determine if it's day or night (6 AM to 6 PM is day)
        const isDay = this.currentTime >= 6 && this.currentTime < 18;
        
        // Remove existing classes
        this.timeIcon.classList.remove('sun', 'moon');
        
        if (isDay) {
            this.timeIcon.classList.add('sun');
            // Sun icon
            this.timeIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
            `;
        } else {
            this.timeIcon.classList.add('moon');
            // Moon icon
            this.timeIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    }

    private notifyTimeChange(): void {
        if (this.onTimeChangeCallback) {
            this.onTimeChangeCallback(this.currentTime);
        }
    }

    public onTimeChange(callback: (time: number) => void): void {
        this.onTimeChangeCallback = callback;
    }

    public setTime(time: number): void {
        this.currentTime = Math.max(0, Math.min(24, time));
        this.updateSlider();
        this.updateTimeDisplay();
        this.updateIcon();
    }

    public getTime(): number {
        return this.currentTime;
    }
}


