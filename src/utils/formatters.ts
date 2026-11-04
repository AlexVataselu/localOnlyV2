/** One currency everywhere: prices are in Romanian lei. */
export const formatPrice = (price: number): string => {
  return `${Math.round(price)} Lei`;
};

/** e.g. "300 Lei" or "100 eur". For "From X / person" use: `From ${formatPriceWithUnit(price, unit)} / person` */
export const formatPriceWithUnit = (price: number, unit: string = "Lei"): string => {
  return `${Math.round(price)} ${unit}`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

