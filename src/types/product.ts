export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
  category: string;
  description: string;
  location: string;
  postedDate: string;
  seller: {
    name: string;
    avatar: string;
    memberSince: string;
    rating: number;
  };
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}
