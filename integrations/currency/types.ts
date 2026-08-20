export type FxQuote = {
  base: string;
  quote: string;
  rate: number;
  source: string;
  fetchedAt: Date;
};

export interface CurrencyProvider {
  readonly name: string;
  fetchRate(base: string, quote: string): Promise<FxQuote>;
}
