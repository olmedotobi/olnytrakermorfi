export type Food = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
};

export const FOODS_DB: Food[] = [
  // Proteínas animales
  { name: "Pechuga de pollo (cocida)", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Proteína" },
  { name: "Muslo de pollo (cocido)", calories: 209, protein: 26, carbs: 0, fat: 11, category: "Proteína" },
  { name: "Carne de res magra", calories: 215, protein: 26, carbs: 0, fat: 12, category: "Proteína" },
  { name: "Carne de res 80/20", calories: 254, protein: 26, carbs: 0, fat: 17, category: "Proteína" },
  { name: "Lomo de cerdo", calories: 212, protein: 29, carbs: 0, fat: 10, category: "Proteína" },
  { name: "Salmón al horno", calories: 208, protein: 20, carbs: 0, fat: 13, category: "Proteína" },
  { name: "Atún en lata (en agua)", calories: 116, protein: 26, carbs: 0, fat: 1, category: "Proteína" },
  { name: "Tilapia al horno", calories: 128, protein: 26, carbs: 0, fat: 2.7, category: "Proteína" },
  { name: "Merluza", calories: 92, protein: 18, carbs: 0, fat: 2, category: "Proteína" },
  { name: "Camarones cocidos", calories: 99, protein: 24, carbs: 0, fat: 0.3, category: "Proteína" },
  { name: "Huevo entero", calories: 155, protein: 13, carbs: 1.1, fat: 11, category: "Proteína" },
  { name: "Clara de huevo", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, category: "Proteína" },
  { name: "Tofu firme", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, category: "Proteína" },
  { name: "Tempeh", calories: 193, protein: 19, carbs: 9, fat: 11, category: "Proteína" },
  { name: "Jamón cocido (bajo grasa)", calories: 107, protein: 17, carbs: 1.5, fat: 3.5, category: "Proteína" },
  { name: "Pavo pechuga", calories: 135, protein: 30, carbs: 0, fat: 1, category: "Proteína" },
  { name: "Sardinas en lata", calories: 208, protein: 25, carbs: 0, fat: 11, category: "Proteína" },
  // Lácteos
  { name: "Leche entera", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, category: "Lácteos" },
  { name: "Leche descremada", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, category: "Lácteos" },
  { name: "Yogur griego (0%)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: "Lácteos" },
  { name: "Yogur natural", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, category: "Lácteos" },
  { name: "Queso fresco", calories: 98, protein: 10, carbs: 3.4, fat: 4.3, category: "Lácteos" },
  { name: "Queso mozzarella", calories: 280, protein: 28, carbs: 2.2, fat: 17, category: "Lácteos" },
  { name: "Queso cheddar", calories: 403, protein: 25, carbs: 1.3, fat: 33, category: "Lácteos" },
  { name: "Queso cottage (bajo grasa)", calories: 72, protein: 12, carbs: 2.7, fat: 1, category: "Lácteos" },
  { name: "Requesón", calories: 105, protein: 11, carbs: 3, fat: 5, category: "Lácteos" },
  // Carbohidratos
  { name: "Arroz blanco cocido", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: "Carbohidratos" },
  { name: "Arroz integral cocido", calories: 123, protein: 2.6, carbs: 26, fat: 0.9, category: "Carbohidratos" },
  { name: "Pasta cocida (sin salsa)", calories: 131, protein: 5, carbs: 25, fat: 1.1, category: "Carbohidratos" },
  { name: "Pan blanco", calories: 265, protein: 9, carbs: 49, fat: 3.2, category: "Carbohidratos" },
  { name: "Pan integral", calories: 247, protein: 13, carbs: 41, fat: 4.2, category: "Carbohidratos" },
  { name: "Avena cocida", calories: 71, protein: 2.5, carbs: 12, fat: 1.4, category: "Carbohidratos" },
  { name: "Avena en hojuelas (cruda)", calories: 389, protein: 17, carbs: 66, fat: 7, category: "Carbohidratos" },
  { name: "Quinoa cocida", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, category: "Carbohidratos" },
  { name: "Papa cocida", calories: 87, protein: 1.9, carbs: 20, fat: 0.1, category: "Carbohidratos" },
  { name: "Papa al horno", calories: 93, protein: 2.5, carbs: 21, fat: 0.1, category: "Carbohidratos" },
  { name: "Batata / Camote cocido", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: "Carbohidratos" },
  { name: "Maíz cocido", calories: 96, protein: 3.4, carbs: 21, fat: 1.5, category: "Carbohidratos" },
  { name: "Tortilla de maíz", calories: 218, protein: 5.7, carbs: 44, fat: 3.3, category: "Carbohidratos" },
  { name: "Tortilla de trigo", calories: 312, protein: 8.5, carbs: 50, fat: 8, category: "Carbohidratos" },
  { name: "Cuscús cocido", calories: 112, protein: 3.8, carbs: 23, fat: 0.2, category: "Carbohidratos" },
  // Legumbres
  { name: "Lentejas cocidas", calories: 116, protein: 9, carbs: 20, fat: 0.4, category: "Legumbres" },
  { name: "Garbanzos cocidos", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, category: "Legumbres" },
  { name: "Frijoles negros cocidos", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, category: "Legumbres" },
  { name: "Frijoles pintos cocidos", calories: 143, protein: 9, carbs: 26, fat: 0.6, category: "Legumbres" },
  { name: "Edamame cocido", calories: 122, protein: 11, carbs: 10, fat: 5.2, category: "Legumbres" },
  // Verduras
  { name: "Brócoli al vapor", calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, category: "Verduras" },
  { name: "Espinacas crudas", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: "Verduras" },
  { name: "Zanahoria cruda", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: "Verduras" },
  { name: "Tomate crudo", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: "Verduras" },
  { name: "Lechuga romana", calories: 17, protein: 1.2, carbs: 3.3, fat: 0.3, category: "Verduras" },
  { name: "Pepino crudo", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, category: "Verduras" },
  { name: "Cebolla cruda", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, category: "Verduras" },
  { name: "Pimiento rojo", calories: 31, protein: 1, carbs: 6, fat: 0.3, category: "Verduras" },
  { name: "Pimiento verde", calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, category: "Verduras" },
  { name: "Coliflor al vapor", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, category: "Verduras" },
  { name: "Calabacín crudo", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, category: "Verduras" },
  { name: "Berenjena cocida", calories: 35, protein: 0.8, carbs: 8.7, fat: 0.2, category: "Verduras" },
  { name: "Col rizada (kale)", calories: 49, protein: 4.3, carbs: 9, fat: 0.9, category: "Verduras" },
  { name: "Apio crudo", calories: 16, protein: 0.7, carbs: 3, fat: 0.2, category: "Verduras" },
  { name: "Rábano", calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, category: "Verduras" },
  { name: "Champiñones crudos", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, category: "Verduras" },
  { name: "Espárragos cocidos", calories: 22, protein: 2.4, carbs: 4.1, fat: 0.2, category: "Verduras" },
  // Frutas
  { name: "Manzana", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: "Frutas" },
  { name: "Plátano / Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: "Frutas" },
  { name: "Naranja", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: "Frutas" },
  { name: "Fresa", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, category: "Frutas" },
  { name: "Uvas", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, category: "Frutas" },
  { name: "Sandía", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, category: "Frutas" },
  { name: "Melón", calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, category: "Frutas" },
  { name: "Pera", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, category: "Frutas" },
  { name: "Durazno / Melocotón", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, category: "Frutas" },
  { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: "Frutas" },
  { name: "Piña", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, category: "Frutas" },
  { name: "Kiwi", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, category: "Frutas" },
  { name: "Mandarina", calories: 53, protein: 0.8, carbs: 13, fat: 0.3, category: "Frutas" },
  { name: "Arándanos", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, category: "Frutas" },
  // Grasas saludables
  { name: "Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15, category: "Grasas" },
  { name: "Aceite de oliva", calories: 884, protein: 0, carbs: 0, fat: 100, category: "Grasas" },
  { name: "Aceite de coco", calories: 862, protein: 0, carbs: 0, fat: 100, category: "Grasas" },
  { name: "Mantequilla", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, category: "Grasas" },
  { name: "Almendras", calories: 579, protein: 21, carbs: 22, fat: 50, category: "Grasas" },
  { name: "Nueces", calories: 654, protein: 15, carbs: 14, fat: 65, category: "Grasas" },
  { name: "Cacahuates / Maníes", calories: 567, protein: 26, carbs: 16, fat: 49, category: "Grasas" },
  { name: "Mantequilla de maní", calories: 588, protein: 25, carbs: 20, fat: 50, category: "Grasas" },
  { name: "Chía semillas", calories: 486, protein: 17, carbs: 42, fat: 31, category: "Grasas" },
  { name: "Linaza semillas", calories: 534, protein: 18, carbs: 29, fat: 42, category: "Grasas" },
  { name: "Semillas de calabaza", calories: 559, protein: 30, carbs: 11, fat: 49, category: "Grasas" },
  // Comidas procesadas
  { name: "Arroz con pollo (casero)", calories: 170, protein: 12, carbs: 22, fat: 4, category: "Comidas" },
  { name: "Pizza margarita", calories: 266, protein: 11, carbs: 33, fat: 10, category: "Comidas" },
  { name: "Hamburguesa (sin pan)", calories: 295, protein: 24, carbs: 0, fat: 21, category: "Comidas" },
  { name: "Ensalada César (sin aderezo)", calories: 34, protein: 2.8, carbs: 5.5, fat: 0.7, category: "Comidas" },
  // Bebidas
  { name: "Leche de almendra sin azúcar", calories: 13, protein: 0.5, carbs: 0.3, fat: 1.1, category: "Bebidas" },
  { name: "Jugo de naranja natural", calories: 45, protein: 0.7, carbs: 10, fat: 0.2, category: "Bebidas" },
  { name: "Café negro", calories: 2, protein: 0.3, carbs: 0, fat: 0, category: "Bebidas" },
  { name: "Proteína en polvo (whey)", calories: 373, protein: 78, carbs: 8, fat: 5, category: "Suplementos" },
];

export function searchFoods(query: string): Food[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return FOODS_DB.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 12);
}
