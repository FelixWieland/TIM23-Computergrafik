/**
 * Represents a guided tour through the scene with multiple animated steps.
 * Tours smoothly animate the camera and scene settings to show interesting views.
 */
export class Tour {
    name;
    description;
    parameters;
    
    /**
     * Creates a new tour with a name, description, and sequence of animated steps.
     * @param name The tour name displayed to users
     * @param description Brief description of what the tour shows
     * @param parameters Array of tour steps to animate through in sequence
     */
    constructor(name, description, parameters) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
    }
}
