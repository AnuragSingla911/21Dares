export type DareCategory =
  | "fun"
  | "funny"
  | "creative"
  | "friends"
  | "couples";

export type DareDifficulty = "easy" | "medium" | "bold";

export type Dare = {
  id: string;
  text: string;
  category: DareCategory;
  difficulty: DareDifficulty;
  familyFriendly: boolean;
};

export type DareCategoryFilter = DareCategory | "mixed";
