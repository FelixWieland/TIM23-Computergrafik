/**
 * Displays a popup with available tours that users can select to view.
 * Tours are automated camera movements that show different parts of the scene.
 */
export class TourControl {
    popupContainer;
    tourListContainer;
    onTourSelectCallback;

    /**
     * Creates a tour control popup with a list of available tours.
     * @param tours Array of tour definitions to display
     */
    constructor(tours = []) {
        this.popupContainer = document.getElementById('tours-popup');
        this.tourListContainer = document.getElementById('tours-list');
        if (!this.popupContainer || !this.tourListContainer) {
            console.error('Tours popup elements not found');
            return;
        }
        if (tours.length > 0) {
            this.setTours(tours);
        }
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for closing the popup when clicking outside or pressing Escape.
     */
    setupEventListeners() {
        this.popupContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        document.addEventListener('click', (e) => {
            const toursButton = document.getElementById('tours-control');
            const isOutsidePopup = !this.popupContainer.contains(e.target);
            const isNotToursButton = e.target !== toursButton;
            if (isOutsidePopup && isNotToursButton && this.isOpen()) {
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
     * Populates the tour list with clickable tour items.
     * @param tours Array of tours to display
     */
    setTours(tours) {
        this.tourListContainer.innerHTML = '';
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

    /**
     * Handles selecting a tour and notifies the callback.
     * @param tour The tour that was selected
     */
    selectTour(tour) {
        if (this.onTourSelectCallback) {
            this.onTourSelectCallback(tour);
        }
        this.close();
    }

    /**
     * Shows the tour selection popup with smooth animation.
     */
    show() {
        this.popupContainer.style.display = 'block';
        requestAnimationFrame(() => {
            this.popupContainer.classList.add('show');
        });
    }

    /**
     * Hides the tour selection popup with smooth animation.
     */
    close() {
        this.popupContainer.classList.remove('show');
        setTimeout(() => {
            this.popupContainer.style.display = 'none';
        }, 300);
    }

    /**
     * Checks if the tour popup is currently visible.
     * @return True if visible, false if hidden
     */
    isOpen() {
        return this.popupContainer.classList.contains('show');
    }

    /**
     * Registers a function to be called when a tour is selected.
     * @param callback Function that receives the selected tour
     */
    onTourSelect(callback) {
        this.onTourSelectCallback = callback;
    }
}
