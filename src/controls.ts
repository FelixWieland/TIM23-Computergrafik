/**
 * Manages UI control buttons and connects them to their actions.
 * Provides easy registration of click handlers for slideshow, time picker, fog, clouds, lanterns, and tours.
 */
export class Controls {

    private previousButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;
    private tourControlButton: HTMLButtonElement;
    private timePickerButton: HTMLButtonElement;
    private fogControlButton: HTMLButtonElement;
    private cloudControlButton: HTMLButtonElement;
    private lanternControlButton: HTMLButtonElement;
    private fullscreenButton: HTMLButtonElement;

    /**
     * Creates a new controls manager and finds all control buttons in the HTML.
     */
    constructor() {
        this.previousButton = document.getElementById('previous') as HTMLButtonElement;
        this.nextButton = document.getElementById('next') as HTMLButtonElement;
        this.tourControlButton = document.getElementById('tours-control') as HTMLButtonElement;
        this.timePickerButton = document.getElementById('time-picker') as HTMLButtonElement;
        this.fogControlButton = document.getElementById('fog-control') as HTMLButtonElement;
        this.cloudControlButton = document.getElementById('cloud-control') as HTMLButtonElement;
        this.lanternControlButton = document.getElementById('lantern-control') as HTMLButtonElement;
        this.fullscreenButton = document.getElementById('fullscreen') as HTMLButtonElement;
    }

    /**
     * Connects an action to the previous slide button.
     * @param action The function to call when the button is clicked
     */
    registerPreviousButton(action: () => void): void {
        this.previousButton.addEventListener('click', action);
    }
    
    /**
     * Connects an action to the next slide button.
     * @param action The function to call when the button is clicked
     */
    registerNextButton(action: () => void): void {
        this.nextButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the tour control button.
     * @param action The function to call when the button is clicked
     */
    registerTourControlButton(action: () => void): void {
        this.tourControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the time picker button.
     * @param action The function to call when the button is clicked
     */
    registerTimePickerButton(action: () => void): void {
        this.timePickerButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the fog control button.
     * @param action The function to call when the button is clicked
     */
    registerFogControlButton(action: () => void): void {
        this.fogControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the cloud control button.
     * @param action The function to call when the button is clicked
     */
    registerCloudControlButton(action: () => void): void {
        this.cloudControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the lantern control button.
     * @param action The function to call when the button is clicked
     */
    registerLanternControlButton(action: () => void): void {
        this.lanternControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the fullscreen button.
     * @param action The function to call when the button is clicked
     */
    registerFullscreenButton(action: () => void): void {
        this.fullscreenButton.addEventListener('click', action);
    }
}