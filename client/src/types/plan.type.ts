export interface Plan {
  id: number;
  title: string; // VD: "Beginner"
  description: string; // VD: "Career coaching session..."
  duration: number; // VD: 70 (minutes)
  price: number; // VD: 70 ($)
  isActive: boolean;
  features?: string[];
}
