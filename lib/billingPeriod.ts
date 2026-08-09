export type BillingPeriod = {
  start: string;
  end: string;
  label: string;
};

export function getCurrentBillingPeriod(
  referenceDate = new Date()
): BillingPeriod {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const startDay =
    referenceDate.getDate() <= 15 ? 1 : 16;

  const endDay =
    startDay === 1
      ? 15
      : new Date(year, month + 1, 0).getDate();

  const start = formatDate(
    new Date(year, month, startDay)
  );

  const end = formatDate(
    new Date(year, month, endDay)
  );

  return {
    start,
    end,
    label: `${formatLabel(start)} - ${formatLabel(end)}`,
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatLabel(value: string): string {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isDateInBillingPeriod(
  value: string,
  period: BillingPeriod
): boolean {
  return (
    value >= period.start &&
    value <= period.end
  );
}
