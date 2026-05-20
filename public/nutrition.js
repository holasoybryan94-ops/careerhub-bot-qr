// Built-in food database (per 100g). Extend freely.
// Values are reasonable averages; verify against a labelled source for precision.
const FOODS = [
  { name: 'Chicken breast (cooked)', kcal: 165, p: 31, c: 0,  f: 3.6 },
  { name: 'Salmon (cooked)',         kcal: 208, p: 20, c: 0,  f: 13 },
  { name: 'Tuna (canned, water)',    kcal: 116, p: 26, c: 0,  f: 1 },
  { name: 'Ground beef 90/10',       kcal: 217, p: 26, c: 0,  f: 12 },
  { name: 'Egg (whole)',             kcal: 155, p: 13, c: 1.1,f: 11 },
  { name: 'Egg white',               kcal: 52,  p: 11, c: 0.7,f: 0.2 },
  { name: 'Greek yogurt (non-fat)',  kcal: 59,  p: 10, c: 3.6,f: 0.4 },
  { name: 'Cottage cheese (low fat)',kcal: 72,  p: 12, c: 2.7,f: 1 },
  { name: 'Milk (2%)',               kcal: 50,  p: 3.3,c: 4.8,f: 2 },
  { name: 'Whey protein powder',     kcal: 380, p: 80, c: 8,  f: 4 },
  { name: 'Oats (dry)',              kcal: 389, p: 17, c: 66, f: 7 },
  { name: 'White rice (cooked)',     kcal: 130, p: 2.7,c: 28, f: 0.3 },
  { name: 'Brown rice (cooked)',     kcal: 123, p: 2.7,c: 26, f: 1 },
  { name: 'Quinoa (cooked)',         kcal: 120, p: 4.4,c: 21, f: 1.9 },
  { name: 'Pasta (cooked)',          kcal: 131, p: 5,  c: 25, f: 1.1 },
  { name: 'Bread (whole wheat)',     kcal: 247, p: 13, c: 41, f: 3.4 },
  { name: 'Sweet potato (baked)',    kcal: 90,  p: 2,  c: 21, f: 0.2 },
  { name: 'Potato (baked)',          kcal: 93,  p: 2.5,c: 21, f: 0.1 },
  { name: 'Avocado',                 kcal: 160, p: 2,  c: 9,  f: 15 },
  { name: 'Almonds',                 kcal: 579, p: 21, c: 22, f: 50 },
  { name: 'Peanut butter',           kcal: 588, p: 25, c: 20, f: 50 },
  { name: 'Olive oil',               kcal: 884, p: 0,  c: 0,  f: 100 },
  { name: 'Banana',                  kcal: 89,  p: 1.1,c: 23, f: 0.3 },
  { name: 'Apple',                   kcal: 52,  p: 0.3,c: 14, f: 0.2 },
  { name: 'Blueberries',             kcal: 57,  p: 0.7,c: 14, f: 0.3 },
  { name: 'Broccoli (cooked)',       kcal: 35,  p: 2.4,c: 7,  f: 0.4 },
  { name: 'Spinach (raw)',           kcal: 23,  p: 2.9,c: 3.6,f: 0.4 },
  { name: 'Black beans (cooked)',    kcal: 132, p: 8.9,c: 24, f: 0.5 },
  { name: 'Lentils (cooked)',        kcal: 116, p: 9,  c: 20, f: 0.4 },
  { name: 'Tofu (firm)',             kcal: 144, p: 17, c: 3,  f: 9 },
  { name: 'Cheddar cheese',          kcal: 403, p: 25, c: 1.3,f: 33 },
  { name: 'Dark chocolate 70%',      kcal: 598, p: 7.8,c: 46, f: 43 },
];

const Nutrition = {
  search(q) {
    if (!q) return [];
    const term = q.toLowerCase();
    return FOODS.filter(f => f.name.toLowerCase().includes(term)).slice(0, 8);
  },
  // Sum meals into totals.
  totals(meals) {
    return meals.reduce((acc, m) => {
      const factor = (m.grams || 0) / 100;
      acc.kcal += (m.per100.kcal || 0) * factor;
      acc.p    += (m.per100.p || 0) * factor;
      acc.c    += (m.per100.c || 0) * factor;
      acc.f    += (m.per100.f || 0) * factor;
      return acc;
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  },
  format(n, digits = 0) {
    if (!isFinite(n)) return '0';
    return n.toFixed(digits);
  }
};
