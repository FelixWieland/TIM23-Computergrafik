/**
 * Manages fullscreen mode toggling with a button that shows the appropriate icon.
 * Handles cross-browser fullscreen API differences.
 */
export class FullscreenControl {
    fullscreenButton;
    enterIcon;
    exitIcon;

    /**
     * Creates a fullscreen control and sets up event listeners.
     */
    constructor() {
        this.fullscreenButton = document.getElementById('fullscreen');
        this.enterIcon = document.getElementById('fullscreen-enter');
        this.exitIcon = document.getElementById('fullscreen-exit');
        this.setupEventListeners();
        this.updateIcon();
    }

    /**
     * Sets up event listeners for fullscreen changes across different browsers.
     */
    setupEventListeners() {
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        document.addEventListener('fullscreenchange', () => {
            this.updateIcon();
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.updateIcon();
        });
        document.addEventListener('mozfullscreenchange', () => {
            this.updateIcon();
        });
        document.addEventListener('MSFullscreenChange', () => {
            this.updateIcon();
        });
    }

    /**
     * Toggles between fullscreen and windowed mode.
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
        else {
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    }

    /**
     * Switches between enter and exit fullscreen icons based on current state.
     */
    updateIcon() {
        if (this.enterIcon && this.exitIcon) {
            if (document.fullscreenElement) {
                this.enterIcon.style.display = 'none';
                this.exitIcon.style.display = 'block';
            }
            else {
                this.enterIcon.style.display = 'block';
                this.exitIcon.style.display = 'none';
            }
        }
    }
    
    /**
     * Checks if the page is currently in fullscreen mode.
     * @return True if fullscreen, false if windowed
     */
    isFullscreen() {
        return !!document.fullscreenElement;
    }
}
