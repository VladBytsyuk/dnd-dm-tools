import type { FullWeapon } from "../models/weapon/FullWeapon";
import type { SmallWeapon } from "../models/weapon/SmallWeapon";

export interface Arsenal {   

    /**
     * Initializes the arsenal by loading data.
     * This method should be called before using any other methods of the arsenal.
     * It loads the small weapon data.
     * @returns {Promise<void>} A promise that resolves when the arsenal is initialized.
     * TODO: rework error hadling
     */
    initialize(): Promise<void>;
    /**
     * Disposes of the arsenal resources.          
     * This method should be called when the arsenal is no longer needed to free up resources. 
     * It does not return a value.
     * @returns {void}
     */
    dispose(): void;

    /**
     * Returns all small weapons from the arsenal.
     * @returns {Promise<SmallWeapon[]>} A promise that resolves to an array of SmallWeapon objects.
     */
    getAllSmallWeapons(): Promise<SmallWeapon[]>;
    /**
     * Returns all small weapons names from the arsenal.
     * @returns {Promise<string[]>} A promise that resolves to an array of strings containing the names of all small weapons.
     */ 
    getAllSmallWeaponsNames(): Promise<string>;

    /**
     * Returns a full weapon by its URL.
     * @param {string} url - The URL of the weapon to fetch.
     * @returns {Promise<FullWeapon | null>} A promise that resolves to a FullWeapon object if found, or null if not found.
     */
    getFullWeaponByUrl(url: string): Promise<FullWeapon | null>;
    /**
     * Returns a full weapon by its name.
     * @param {string} monsterName - The name of the weapon to fetch.
     * @returns {Promise<FullWeapon | null>} A promise that resolves to a FullWeapon object if found, or null if not found.
     */
    getFullWeaponByName(name: string): Promise<FullWeapon | null>;
    /**
     * Returns a full weapon by its SmallWeapon object.
     * @param {SmallWeapon} smallWeapon - The SmallWeapon object to fetch the full weapon for.
     * @returns {Promise<FullWeapon | null>} A promise that resolves to a FullWeapon object if found, or null if not found.
     */ 
    getFullWeaponBySmallWeapon(smallWeapon: SmallWeapon): Promise<FullWeapon | null>;
}
