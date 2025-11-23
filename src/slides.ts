/**
 * Manages a horizontal slideshow for presenting information.
 * Allows navigation between slides using keyboard arrows or buttons, with smooth animations.
 */
export class Slideshow {
    private slideshow: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private currentSlide: number = 0;
    private totalSlides: number;
    private resizeTimeout: number | null = null;

    /**
     * Creates a new slideshow and finds all slide elements in the page.
     * In development mode, starts on the last slide for easier testing.
     */
    constructor() {
        this.slideshow = document.querySelector('.slideshow') as HTMLElement;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) {
            console.warn('No slides found');
            return;
        }

        // In development we set the initial slide to the last slide
        // this improves the development experience
        if (import.meta.env.DEV) {
            this.currentSlide = this.totalSlides - 1;
        }

        this.init();
    }

    /**
     * Initializes the slideshow by setting up styles, event listeners, and positioning.
     */
    private init(): void {
        this.slideshow.style.display = 'flex';
        this.slideshow.style.flexDirection = 'row';
        this.slideshow.style.gap = '0px';
        this.slideshow.style.transition = 'transform 0.3s ease-in-out';
        this.slideshow.style.transform = 'translateX(0)';

        this.calculateAndSetDimensions();

        this.slideshow.setAttribute('data-slide', this.currentSlide.toString());
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        this.updateSlidePosition();
    }

    /**
     * Handles keyboard arrow presses for slide navigation.
     * @param event The keyboard event containing the pressed key
     */
    private handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                break;
        }
    }

    /**
     * Calculates and applies the correct width for the slideshow and each slide based on window size.
     */
    private calculateAndSetDimensions(): void {
        const slideWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const totalWidth = this.totalSlides * slideWidth;
        
        this.slideshow.style.width = `${totalWidth}px`;
        
        this.slides.forEach(slide => {
            slide.style.flexShrink = '0';
            slide.style.width = `${slideWidth}px`;
        });
    }

    /**
     * Handles window resize events by recalculating slide dimensions after a short delay.
     */
    private handleResize(): void {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = window.setTimeout(() => {
            this.calculateAndSetDimensions();
            this.updateSlidePosition();
        }, 150);
    }

    /**
     * Moves to the next slide if one is available.
     */
    public nextSlide(): void {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateSlidePosition();
        }
    }

    /**
     * Moves to the previous slide if one is available.
     */
    public previousSlide(): void {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlidePosition();
        }
    }

    /**
     * Updates the slideshow's position to show the current slide with smooth animation.
     */
    private updateSlidePosition(): void {
        const slideWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const translateX = -this.currentSlide * slideWidth;
        this.slideshow.style.transform = `translateX(${translateX}px)`;
        this.slideshow.setAttribute('data-slide', this.currentSlide.toString());
    }

    /**
     * Jumps directly to a specific slide by index.
     * @param slideIndex The index of the slide to display (0-based)
     */
    public goToSlide(slideIndex: number): void {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            this.currentSlide = slideIndex;
            this.updateSlidePosition();
        }
    }

    /**
     * Gets the index of the currently displayed slide.
     * @return The current slide index (0-based)
     */
    public getCurrentSlide(): number {
        return this.currentSlide;
    }

    /**
     * Gets the total number of slides in the slideshow.
     * @return The total slide count
     */
    public getTotalSlides(): number {
        return this.totalSlides;
    }
}
