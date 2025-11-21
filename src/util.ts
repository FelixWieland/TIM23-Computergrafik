/**
 * Utility functions for coordinate conversion between lat/long and 3D world coordinates
 */

// Reference points for coordinate system
const REF_LAT = 48.0951;  // Reference latitude
const REF_LONG = 9.7824;  // Reference longitude

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Calculate the distance between two points on Earth using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return EARTH_RADIUS * c;
}

/**
 * Convert latitude and longitude to 3D world coordinates
 * @param lat Latitude
 * @param long Longitude
 * @returns Object with x, y, z coordinates (y is always 1 for ground level)
 */
export function coordsToPixel(lat: number, long: number): { x: number; y: number; z: number } {
    // Calculate distance from reference point
    const distance = haversineDistance(REF_LAT, REF_LONG, lat, long);
    
    // Calculate bearing (direction) from reference point
    const dLon = (long - REF_LONG) * Math.PI / 180;
    const lat1 = REF_LAT * Math.PI / 180;
    const lat2 = lat * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x);
    
    // Convert to 3D coordinates
    // Scale: 1 meter = 1 unit in 3D space
    const x3d = Math.sin(bearing) * distance;
    const z3d = Math.cos(bearing) * distance;
    
    return {
        x: x3d,
        y: 1, // Ground level
        z: z3d
    };
}

/**
 * Calculate the distance between the two reference points for scaling
 */
export function getReferenceDistance(): number {
    return haversineDistance(48.0951, 9.7824, 48.1017, 9.7972);
}

/**
 * Calculate the actual dimensions of the area between the two reference points
 * @returns Object with width and depth in meters
 */
export function getAreaDimensions(): { width: number; depth: number } {
    // Calculate the actual geographic dimensions
    // Point 1: 48.0951, 9.7824
    // Point 2: 48.1017, 9.7972
    
    // Calculate the width (latitude difference)
    const lat1 = 48.0951;
    const lat2 = 48.1017;
    const width = haversineDistance(lat1, 9.7824, lat2, 9.7824);
    
    // Calculate the depth (longitude difference)
    const lon1 = 9.7824;
    const lon2 = 9.7972;
    const depth = haversineDistance(48.0951, lon1, 48.0951, lon2);
    
    return { width, depth };
}

/**
 * Get the reference point coordinates
 */
export function getReferencePoint(): { lat: number; long: number } {
    return { lat: REF_LAT, long: REF_LONG };
}
