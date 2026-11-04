import { ActivityType, TimeOfDay, Duration, Special } from "./filters";

export interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  description?: string;
  activityTypes?: ActivityType[];
  timeOfDays?: TimeOfDay[];
  duration?: Duration | null;
  specials?: Special[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  hostName?: string | null;
  hostImage?: string | null;
}

