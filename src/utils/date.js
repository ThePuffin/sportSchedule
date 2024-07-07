export const readableDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

export const isExpiredData = (date) => {
  const expirationDay = 7;
  const now = new Date();
  const differenceInMilliseconds = now.getTime() - new Date(date).getTime();
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  return differenceInDays >= expirationDay;
};
