/**
 * Manages fullscreen mode toggling with a button that shows the appropriate icon.
 * Handles cross-browser fullscreen API differences.
 */
export class FullscreenControl {
    private fullscreenButton: HTMLButtonElement;
    private enterIcon: HTMLElement;
    private exitIcon: HTMLElement;

    /**
     * Creates a fullscreen control and sets up event listeners.
     */
    constructor() {
        this.fullscreenButton = document.getElementById('fullscreen') as HTMLButtonElement;
        this.enterIcon = document.getElementById('fullscreen-enter') as HTMLElement;
        this.exitIcon = document.getElementById('fullscreen-exit') as HTMLElement;

        this.setupEventListeners();
        this.updateIcon();
    }

    /**
     * Sets up event listeners for fullscreen changes across different browsers.
     */
    private setupEventListeners(): void {
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
    private toggleFullscreen(): void {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    }

    /**
     * Switches between enter and exit fullscreen icons based on current state.
     */
    private updateIcon(): void {
        if (this.enterIcon && this.exitIcon) {
            if (document.fullscreenElement) {
                this.enterIcon.style.display = 'none';
                this.exitIcon.style.display = 'block';
            } else {
                this.enterIcon.style.display = 'block';
                this.exitIcon.style.display = 'none';
            }
        }
    }

    /**
     * Checks if the page is currently in fullscreen mode.
     * @return True if fullscreen, false if windowed
     */
    public isFullscreen(): boolean {
        return !!document.fullscreenElement;
    }
}

