//export type AnimalType = "lion" | "tiger"  | "hippopotamus" | 
//"italian-stream-frog" | "japanese-fire-bellied-newt"| "unknown"

export class AnimalType {
    static readonly LION = new AnimalType("savannah.jpg", "lion.glb", true, false);
    static readonly ZEBRA = new AnimalType("savannah.jpg", "zebra.glb", false, true);
    static readonly HIPPOPOTAMUS = new AnimalType("water-hole.jpg", "hippo.glb", true, true);
    static readonly TIGER = new AnimalType("jungle.jpg", "tiger.glb", true, false);
    static readonly FROG = new AnimalType("pond.jpg", "frog.glb", true, false);
    static readonly NEWT = new AnimalType("pond.jpg", "newt.glb", true, false);
    static readonly DOG = new AnimalType("city.jpg", "dog.glb", true, true);
    static readonly CAT = new AnimalType("city.jpg", "cat.glb", true, false);
    static readonly UNKNOWN = new AnimalType("test.jpg", "animal_test.glb", false, false);

    /** Path to the image file for VR background. */
    readonly backgroundIMG: string;
    /** Path to the 3D model file for VR. */
    readonly model: string;
    /** True if the animal is carnivorous. */
    readonly eatsMeat: boolean;
    /** True if the animal is herbivorous. */
    readonly eatsVeg: boolean;

    constructor(bg: string, model: string, carn: boolean, herb: boolean) {
        this.backgroundIMG = bg;
        this.model = model;
        this.eatsMeat = carn;
        this.eatsVeg = herb;
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