export const formatDateToIST = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export function timeFormat(val) {
  return val?.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shordataformate(data) {
  const date = new Date(data); // convert input to Date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).replace(/,/g,"");
}
export function datewithMonth(val) {
  const date = new Date(val);
  let day = date.getDate();
  let month = date.toLocaleDateString("en-IN", { month: "short" });
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
