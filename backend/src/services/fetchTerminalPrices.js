import { Source } from "../models/source.js";

/**
 * Automated Ex-Terminal LPG Market Price Ingestion Service
 * Simulates/fetches live price adjustments across LPG supply terminals based on daily index fluctuations
 */
export const updateMarketTerminalPrices = async () => {
  const sources = await Source.find();
  if (!sources.length) {
    return { updatedCount: 0, sources: [] };
  }

  const updatedSources = [];
  const fluctuationBase = (Math.random() - 0.45) * 120; // Slight random market drift

  for (const src of sources) {
    // Generate realistic price fluctuation around current baseline
    const currentPrice = src.price_per_mt_ex_terminal || 58000;
    const shift = Math.round((Math.random() * 80 - 40) + fluctuationBase);
    const newPrice = Math.max(45000, Math.min(85000, currentPrice + shift));

    src.price_per_mt_ex_terminal = newPrice;
    await src.save();

    updatedSources.push({
      source_id: src.source_id,
      source_name: src.source_name,
      old_price: currentPrice,
      new_price: newPrice,
      change: newPrice - currentPrice
    });
  }

  return {
    timestamp: new Date(),
    updatedCount: updatedSources.length,
    sources: updatedSources
  };
};
