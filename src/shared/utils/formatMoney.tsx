export const formatVnd = (amount: number): string => {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatUsdToVnd = (usd: number, rate: number = 25400): string => {
  if (isNaN(usd)) return "0 ₫";

  const vnd = usd * rate;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vnd);
};
