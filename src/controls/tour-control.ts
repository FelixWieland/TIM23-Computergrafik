import { Tour } from '../tours/tour';

export class TourControl {
    private popupContainer: HTMLElement;
    private tourListContainer: HTMLElement;
    private onTourSelectCallback?: (tour: Tour) => void;

    constructor() {
        this.popupContainer = document.getElementById('tours-popup') as HTMLElement;
        this.tourListContainer = document.getElementById('tours-list') as HTMLElement;

        if (!this.popupContainer || !this.tourListContainer) {
            console.error('Tours popup elements not found');
            return;
        }

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Prevent clicks inside the popup from closing it
        this.popupContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            const toursButton = document.getElementById('tours-control');
            const isOutsidePopup = !this.popupContainer.contains(e.target as Node);
            const isNotToursButton = e.target !== toursButton;
            
            if (isOutsidePopup && isNotToursButton && this.isOpen()) {
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

    public setTours(tours: Tour[]): void {
        // Clear existing tours
        this.tourListContainer.innerHTML = '';

        // Create tour items
        tours.forEach((tour) => {
            const tourItem = document.createElement('div');
            tourItem.className = 'tour-item';
            tourItem.innerHTML = `
                <div class="tour-item-name">${tour.name}</div>
                <div class="tour-item-description">${tour.description}</div>
            `;
            
            tourItem.addEventListener('click', () => {
                this.selectTour(tour);
            });

            this.tourListContainer.appendChild(tourItem);
        });
    }

    private selectTour(tour: Tour): void {
        if (this.onTourSelectCallback) {
            this.onTourSelectCallback(tour);
        }
        this.close();
    }

    public show(): void {
        this.popupContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.popupContainer.classList.add('show');
        });
    }

    public close(): void {
        this.popupContainer.classList.remove('show');
        setTimeout(() => {
            this.popupContainer.style.display = 'none';
        }, 300);
    }

    public isOpen(): boolean {
        return this.popupContainer.classList.contains('show');
    }

    public onTourSelect(callback: (tour: Tour) => void): void {
        this.onTourSelectCallback = callback;
    }
}

