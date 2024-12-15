import { useState, useEffect } from 'react';

export function FeaturedCoinsSlider({ coins }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % coins.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [coins.length]);

  return (
    <div className="relative bg-gray-800/30 rounded-lg border border-blue-900/20 overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 25}%)` }}
      >
        {coins.map((coin) => (
          <div key={coin.id} className="w-1/4 flex-shrink-0 p-4">
            <div className="flex items-center gap-3 mb-2">
              <img src={coin.image} alt={coin.name} className="w-8 h-8" />
              <span className="text-gray-400 font-medium">
                {coin.symbol.toUpperCase()}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${coin.current_price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
