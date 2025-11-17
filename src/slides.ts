export class Slideshow {
    private slideshow: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private currentSlide: number = 0;
    private totalSlides: number;
    private resizeTimeout: number | null = null;

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

    private init(): void {
        // Set up the slideshow container for horizontal scrolling
        this.slideshow.style.display = 'flex';
        this.slideshow.style.flexDirection = 'row';
        this.slideshow.style.gap = '0px';
        this.slideshow.style.transition = 'transform 0.3s ease-in-out';
        this.slideshow.style.transform = 'translateX(0)';
        
        // Calculate dimensions with fallback
        this.calculateAndSetDimensions();

        // Set initial slide data attribute
        this.slideshow.setAttribute('data-slide', this.currentSlide.toString());

        // Add keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Add debounced window resize listener
        window.addEventListener('resize', this.handleResize.bind(this));

        // Update the slideshow position
        this.updateSlidePosition();
    }

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

    private calculateAndSetDimensions(): void {
        // Get window dimensions with fallback
        const slideWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const totalWidth = this.totalSlides * slideWidth;
        
        this.slideshow.style.width = `${totalWidth}px`;
        
        this.slides.forEach(slide => {
            slide.style.flexShrink = '0';
            slide.style.width = `${slideWidth}px`;
        });
    }

    private handleResize(): void {
        // Debounce resize events to prevent excessive calculations
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = window.setTimeout(() => {
            this.calculateAndSetDimensions();
            this.updateSlidePosition();
        }, 150);
    }

    public nextSlide(): void {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateSlidePosition();
        }
    }

    public previousSlide(): void {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlidePosition();
        }
    }

    private updateSlidePosition(): void {
        const slideWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
        const translateX = -this.currentSlide * slideWidth;
        this.slideshow.style.transform = `translateX(${translateX}px)`;
        this.slideshow.setAttribute('data-slide', this.currentSlide.toString());
    }

    // Public methods for external control if needed
    public goToSlide(slideIndex: number): void {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            this.currentSlide = slideIndex;
            this.updateSlidePosition();
        }
    }

    public getCurrentSlide(): number {
        return this.currentSlide;
    }

    public getTotalSlides(): number {
        return this.totalSlides;
    }
}
