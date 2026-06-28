//export type AnimalType = "lion" | "tiger"  | "hippopotamus" | 
//"italian-stream-frog" | "japanese-fire-bellied-newt"| "unknown"

export enum FoodType {
    NONE = 0,
    MEAT = 1,
    PLANT = 2,
    ALL = FoodType.NONE | FoodType.MEAT | FoodType.PLANT
}

export class AnimalType {
    static readonly LION = new AnimalType("savannah.png", "lion.glb", FoodType.MEAT);
    static readonly ZEBRA = new AnimalType("savannah.png", "zebra.glb", FoodType.PLANT);
    static readonly HIPPOPOTAMUS = new AnimalType("watering-hole.png", "hippopotamus.glb", FoodType.ALL);
    static readonly TIGER = new AnimalType("jungle.png", "tiger.glb", FoodType.MEAT);
    static readonly FROG = new AnimalType("pond.png", "frog.glb", FoodType.MEAT);
    static readonly NEWT = new AnimalType("pond.png", "newt.glb", FoodType.MEAT);
    static readonly DOG = new AnimalType("room.png", "dog.glb", FoodType.ALL);
    static readonly CAT = new AnimalType("room.png", "cat.glb", FoodType.MEAT);
    static readonly UNKNOWN = new AnimalType("test.jpg", "test.glb", FoodType.NONE);

    /** Path to the image file for VR background. */
    readonly backgroundIMG: string;
    /** Path to the 3D model file for VR. */
    readonly model: string;
    /** What the animal eats, used as a bitmask */
    readonly diet: FoodType;

    constructor(bg: string, model: string, diet: FoodType) {
        this.backgroundIMG = bg;
        this.model = model;
        this.diet = diet;
    }

    static fromString(str: string): AnimalType {
        switch(str) {
            case "lion":
                return AnimalType.LION;
            case "zebra":
                return AnimalType.ZEBRA
            case "hippopotamus":
                return AnimalType.HIPPOPOTAMUS;
            case "tiger":
                return AnimalType.TIGER;
            case "italian-stream-frog":
                return AnimalType.FROG;
            case "japanese-fire-bellied-newt":
                return AnimalType.NEWT;
            //TODO: Add dog and cat
            default:
                return AnimalType.UNKNOWN;
        }
    }
}