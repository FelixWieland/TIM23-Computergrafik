/**
 * Manages UI control buttons and connects them to their actions.
 * Provides easy registration of click handlers for slideshow, time picker, fog, clouds, lanterns, and tours.
 */
export class Controls {
    previousButton;
    nextButton;
    tourControlButton;
    timePickerButton;
    fogControlButton;
    cloudControlButton;
    lanternControlButton;
    fullscreenButton;

    /**
     * Creates a new controls manager and finds all control buttons in the HTML.
     */
    constructor() {
        this.previousButton = document.getElementById('previous');
        this.nextButton = document.getElementById('next');
        this.tourControlButton = document.getElementById('tours-control');
        this.timePickerButton = document.getElementById('time-picker');
        this.fogControlButton = document.getElementById('fog-control');
        this.cloudControlButton = document.getElementById('cloud-control');
        this.lanternControlButton = document.getElementById('lantern-control');
        this.fullscreenButton = document.getElementById('fullscreen');
    }

    /**
     * Connects an action to the previous slide button.
     * @param action The function to call when the button is clicked
     */
    registerPreviousButton(action) {
        this.previousButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the next slide button.
     * @param action The function to call when the button is clicked
     */
    registerNextButton(action) {
        this.nextButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the tour control button.
     * @param action The function to call when the button is clicked
     */
    registerTourControlButton(action) {
        this.tourControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the time picker button.
     * @param action The function to call when the button is clicked
     */
    registerTimePickerButton(action) {
        this.timePickerButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the fog control button.
     * @param action The function to call when the button is clicked
     */
    registerFogControlButton(action) {
        this.fogControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the cloud control button.
     * @param action The function to call when the button is clicked
     */
    registerCloudControlButton(action) {
        this.cloudControlButton.addEventListener('click', action);
    }

    /**
     * Connects an action to the lantern control button.
     * @param action The function to call when the button is clicked
     */
    registerLanternControlButton(action) {
        this.lanternControlButton.addEventListener('click', action);
    }
    
    /**
     * Connects an action to the fullscreen button.
     * @param action The function to call when the button is clicked
     */
    registerFullscreenButton(action) {
        this.fullscreenButton.addEventListener('click', action);
    }
}
