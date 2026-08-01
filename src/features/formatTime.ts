import { format, differenceInCalendarDays, isValid, parse } from "date-fns";
import { Timestamp } from "firebase/firestore";

function toDate(input: any): Date | null {
  if (input instanceof Timestamp) return input.toDate();
  if (typeof input === "number") return new Date(input);
  if (typeof input === "string") {
    const parsedDate = parse(
      input,
      "MMMM d, yyyy 'at' h:mm:ss a 'UTC'X",
      new Date()
    );
    if (isValid(parsedDate)) return parsedDate;
    const fallback = new Date(input);
    if (isValid(fallback)) return fallback;
  }
  return null;
}

export const formatTime = (input: any) => {
  const date = toDate(input);
  if (!date) return "";

  const now = new Date();
  const dayDiff = differenceInCalendarDays(
    now.setHours(0, 0, 0, 0),
    date.setHours(0, 0, 0, 0)
  );

  if (dayDiff === 0) return format(date, "h:mm a");
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return format(date, "EEEE");
  return format(date, "MMM d");
};

export const formatDayLabel = (input: any) => {
  const date = toDate(input);
  if (!date) return "";
  const now = new Date();
  const dayDiff = differenceInCalendarDays(
    now.setHours(0, 0, 0, 0),
    date.setHours(0, 0, 0, 0)
  );
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return format(date, "EEEE");
  return format(date, "MMMM d, yyyy");
};
