export function currencyToCents(text: string) {
  const amount = text.match(/\$?([\d,]+(?:\.\d{1,2})?)/)?.[1].replaceAll(',', '');
  expect(amount, `currency amount in "${text}"`).to.not.be.undefined;
  return Math.round(Number(amount) * 100);
}