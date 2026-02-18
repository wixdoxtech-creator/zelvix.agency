export type Ingredient = {
  id: number;
  image: string;
  name: string;
  text: string;
};

export type BenefitItem = {
  heding: string;
  img: string;
  pera: string;
};

export type ProductDetail = {
  slug: string;
  title: string;
  category: string;
  description: string;
  orgPrice: number;
  disPrice: number;
  rating: number;
  images: string[];
  aboutPoints: string[];
  benefits?: BenefitItem[];
  ingredients: { id: number; image: string; name: string; text: string }[];
  ayurvedicSteps: {
    number: string;
    title: string;
    description: string;
    image: string;
    tips: string[];
  }[];
  faqs: FAQItem[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type Product = {
  slug: string;
  title: string;
  category: string;
  description: string;
  orgPrice: number;
  disPrice: number;
  rating: number;
  images: string[];
  aboutPoints: string[];
  ingredients: { id: number; image: string; name: string; text: string }[];
};
