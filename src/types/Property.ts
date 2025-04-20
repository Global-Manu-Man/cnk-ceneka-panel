export interface Property {
  id?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'casa' | 'departamento' | 'terreno';
  status: 'disponible' | 'vendido' | 'reservado';
  features: string[];
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 