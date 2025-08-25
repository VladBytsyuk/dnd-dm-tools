import type { SmallBackground } from "./SmallBackground";

/**
 * Represents a complete background with all detailed information including skills,
 * equipment, starting gold, and descriptive content.
 * 
 * @interface FullBackground
 * @extends SmallBackground
 */
export interface FullBackground extends SmallBackground {

    /** Associated URL for the background */
    associatedUrl?: string;

    /** Associated HTML content for the background */
    associatedHtml?: string;

    /** Array of skill names that this background provides */
    skills: string[];
    
    /** Tool ownership or proficiency information (may contain HTML) */
    toolOwnership: string;
    
    /** Array of equipment items provided by this background */
    equipments: string[];
    
    /** Starting gold amount in gold pieces */
    startGold: number;
    
    /** Detailed description of the background (may contain HTML) */
    description: string;
    
    /** Personalization or roleplaying guidance for the background */
    personalization?: string;
}