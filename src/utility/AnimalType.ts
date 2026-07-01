//export type AnimalType = "lion" | "tiger"  | "hippopotamus" | 
//"italian-stream-frog" | "japanese-fire-bellied-newt"| "unknown"

export enum FoodType {
    NONE = 0,
    MEAT = 1,
    PLANT = 2,
    ALL = FoodType.NONE | FoodType.MEAT | FoodType.PLANT
}

export class AnimalType {
    static readonly LION = new AnimalType("lion", "savannah.png", "lion.glb", FoodType.MEAT);
    static readonly ZEBRA = new AnimalType("zebra", "savannah.png", "zebra.glb", FoodType.PLANT);
    static readonly HIPPOPOTAMUS = new AnimalType("hippopotamus", "watering-hole.png", "hippopotamus.glb", FoodType.ALL);
    static readonly TIGER = new AnimalType("tiger", "jungle.png", "tiger.glb", FoodType.MEAT);
    static readonly FROG = new AnimalType("italian-stream-frog", "pond.png", "frog.glb", FoodType.MEAT);
    static readonly NEWT = new AnimalType("japanese-fire-bellied-newt", "pond.png", "newt.glb", FoodType.MEAT);
    static readonly DOG = new AnimalType("dog", "room.png", "dog.glb", FoodType.ALL);
    static readonly CAT = new AnimalType("cat", "room.png", "cat.glb", FoodType.MEAT);
    static readonly UNKNOWN = new AnimalType("unknown", "test.jpg", "animal_test.glb", FoodType.NONE);

    /** Name of the animal */
    readonly name: string;
    /** Path to the image file for VR background. */
    readonly backgroundIMG: string;
    /** Path to the 3D model file for VR. */
    readonly model: string;
    /** What the animal eats, used as a bitmask */
    readonly diet: FoodType;

    constructor(name: string, bg: string, model: string, diet: FoodType) {
        this.name = name;
        this.backgroundIMG = bg;
        this.model = model;
        this.diet = diet;
    }

    static fromString(str: string): AnimalType {
        switch(str) {
            case AnimalType.LION.name:
                return AnimalType.LION;
            case AnimalType.ZEBRA.name:
                return AnimalType.ZEBRA
            case AnimalType.HIPPOPOTAMUS.name:
                return AnimalType.HIPPOPOTAMUS;
            case AnimalType.TIGER.name:
                return AnimalType.TIGER;
            case AnimalType.FROG.name:
                return AnimalType.FROG;
            case AnimalType.NEWT.name:
                return AnimalType.NEWT;
            case AnimalType.DOG.name:
                return AnimalType.DOG;
            case AnimalType.CAT.name:
                return AnimalType.CAT;
            default:
                return AnimalType.UNKNOWN;
        }
    }
}