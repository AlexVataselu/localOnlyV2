const lei = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 });

/** Prices are whole lei: 1650 -> "1.650 lei". */
export const formatPrice = (price: number): string => `${lei.format(price)} lei`;

export const formatRating = (rating: number): string => rating.toFixed(1);

export const pluralize = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
