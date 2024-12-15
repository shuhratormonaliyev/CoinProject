import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { WatchlistPanel } from '../components/CryptoWatchlist';
import { FeaturedCoinsSlider } from '../components/FeaturedCoinsSlider';
import CoinDetails from './CoinDetails';

export default function CryptoValutes() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [page, setPage] = useState(1);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchedCoins, setWatchedCoins] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('watchedCoins');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedCoin, setSelectedCoin] = useState();
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const navigate = useNavigate()
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.error('Please wait...', err);
      }
    };

    fetchExchangeRates();
  }, []);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}&sparkline=true&price_change_percentage=24h`
        );

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setCoins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= 10) {
      setPage(newPage);
    }
  };

  const toggleWatchlist = () => {
    setIsWatchlistOpen(!isWatchlistOpen);
  };

  const isWatched = (coinId) => {
    return watchedCoins.some((coin) => coin.id === coinId);
  };

  const toggleWatch = (coin, e) => {
    e.stopPropagation();
    const newWatchedCoins = isWatched(coin.id)
      ? watchedCoins.filter((c) => c.id !== coin.id)
      : [...watchedCoins, coin];

    setWatchedCoins(newWatchedCoins);
    localStorage.setItem('watchedCoins', JSON.stringify(newWatchedCoins));
  };

  const removeFromWatchlist = (coinId) => {
    const newWatchedCoins = watchedCoins.filter((c) => c.id !== coinId);
    setWatchedCoins(newWatchedCoins);
    localStorage.setItem('watchedCoins', JSON.stringify(newWatchedCoins));
  };

  const convertPrice = (priceInUSD) => {
    if (currency === 'USD') return priceInUSD;
    const rate = exchangeRates[currency];
    return rate ? priceInUSD * rate : priceInUSD;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleCoinClick = (coinId) => {
    navigate(`/cryptoDetails/${coinId}`)
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <div className="fixed inset-0 bg-[url('/images/imgesbg.jpg')] opacity-20" />
      <div className="relative z-10">
        <header className="flex justify-around items-center p-4 border-b border-blue-900/20">
          <h1 className="text-2xl font-bold text-cyan-400">CRYPTOFOLIO</h1>
          <div className="flex items-center gap-4">
            <select 
              className="select border-blue-900/20"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="RUB">RUB</option>
              <option value="UZS">UZS</option>
            </select>
            <button className="btn btn-outline btn-info" onClick={toggleWatchlist}>WATCH LIST</button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-cyan-400 mb-2 glow">
              CRYPTOFOLIO WATCH LIST
            </h2>
            <p className="text-gray-400">
              Get All The Info Regarding Your Favorite Crypto Currency
            </p>
          </div>

          <div className="mb-12">
            <FeaturedCoinsSlider coins={coins} convertPrice={convertPrice} formatPrice={formatPrice} />
          </div>

          <div className="bg-gray-800/30 rounded-lg border border-blue-900/20 backdrop-blur-sm p-6">
            <h3 className="text-xl font-semibold mb-6">
              Cryptocurrency Prices by Market Cap
            </h3>

            <div className="form-control mb-6">
              <input
                type="text"
                placeholder="Search For a Crypto Currency..."
                className="input w-full bg-gray-900/50 border-blue-900/20"
              />
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <span className="loading loading-spinner loading-lg text-info"></span>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 p-12">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-gray-400 border-blue-900/20">
                      <th>Coin</th>
                      <th>Price</th>
                      <th className="w-48">24h Change</th>
                      <th>Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coins.map((coin) => (
                      <tr
                        key={coin.id}
                        className="border-blue-900/10 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => handleCoinClick(coin.id)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="font-bold">{coin.name}</div>
                              <div className="text-sm text-gray-400">
                                {coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(convertPrice(coin.current_price))}</td>
                        <td className="w-48">
                          <div className=" rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-400 mb-2"></h4>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => toggleWatch(coin, e)}
                                className="btn btn-ghost btn-sm p-0"
                              >
                                {isWatched(coin.id) ? (
                                  <EyeOff className="h-5 w-5 text-cyan-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                              <span
                                className={
                                  coin.price_change_percentage_24h > 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }
                              >
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(convertPrice(coin.market_cap))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center gap-2 mt-6">
              <button
                className="btn btn-circle btn-sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                «
              </button>
              {[...Array(10)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`btn btn-circle btn-sm ${
                    page === i + 1 ? 'btn-info' : ''
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-circle btn-sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === 10}
              >
                »
              </button>
            </div>
          </div>
        </main>
      </div>
      <WatchlistPanel
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchedCoins={watchedCoins}
        onRemoveFromWatchlist={removeFromWatchlist}
        convertPrice={convertPrice}
        formatPrice={formatPrice}
      />
      {selectedCoin && (
        <CoinDetails
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
          convertPrice={convertPrice}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}

