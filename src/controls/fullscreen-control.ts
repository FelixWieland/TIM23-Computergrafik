export class FullscreenControl {
    private fullscreenButton: HTMLButtonElement;
    private enterIcon: HTMLElement;
    private exitIcon: HTMLElement;

    constructor() {
        this.fullscreenButton = document.getElementById('fullscreen') as HTMLButtonElement;
        this.enterIcon = document.getElementById('fullscreen-enter') as HTMLElement;
        this.exitIcon = document.getElementById('fullscreen-exit') as HTMLElement;

        this.setupEventListeners();
        this.updateIcon();
    }

    private setupEventListeners(): void {
        // Handle button click
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Handle fullscreen changes (including vendor prefixes)
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

    public isFullscreen(): boolean {
        return !!document.fullscreenElement;
    }
}

