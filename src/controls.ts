

export class Controls {

    private previousButton: HTMLButtonElement;
    private nextButton: HTMLButtonElement;
    private timePickerButton: HTMLButtonElement;
    private fogControlButton: HTMLButtonElement;
    private cloudControlButton: HTMLButtonElement;

    constructor() {
        this.previousButton = document.getElementById('previous') as HTMLButtonElement;
        this.nextButton = document.getElementById('next') as HTMLButtonElement;
        this.timePickerButton = document.getElementById('time-picker') as HTMLButtonElement;
        this.fogControlButton = document.getElementById('fog-control') as HTMLButtonElement;
        this.cloudControlButton = document.getElementById('cloud-control') as HTMLButtonElement;
    }

    registerPreviousButton(action: () => void): void {
        console.log('registering previous button');
        this.previousButton.addEventListener('click', action);
    }
    
    registerNextButton(action: () => void): void {
        console.log('registering next button');
        this.nextButton.addEventListener('click', action);
    }

    registerTimePickerButton(action: () => void): void {
        console.log('registering time picker button');
        this.timePickerButton.addEventListener('click', action);
    }

    registerFogControlButton(action: () => void): void {
        console.log('registering fog control button');
        this.fogControlButton.addEventListener('click', action);
    }

    registerCloudControlButton(action: () => void): void {
        console.log('registering cloud control button');
        this.cloudControlButton.addEventListener('click', action);
    }
}