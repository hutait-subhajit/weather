"use client"
import React, { useEffect, useRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";


const page = () => {
  const inputRef = useRef(null)
  const [city, setCity] = useState('');
  const [search, setSearch] = useState(city)
  const [prevCity, setPrevCity] = useState("");
  const [data, setData] = useState()
  const [data5, setData5] = useState()
  const [loading, setLoading] = useState(false)
  const [inFarenhite, setInFarenhite] = useState(true)
  const [selectedForecast, setSelectedForecast] = useState(null)
  const [showModal, setShowModal] = useState(false)


  const [error, setError] = useState('');
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();
          const address = data.address;

          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.county || // fallback
            'City not found';

          setCity(cityName);
        } catch (err) {
          setError('Error fetching location details');
        }
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);

  useEffect(() => {
    const fetchWeatherForCity = async () => {
      if (!city || city === prevCity) return;

      setLoading(true);
      try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`);
        const weatherData = await weatherRes.json();
        setData(weatherData);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`);
        const forecastData = await forecastRes.json();
        setData5(forecastData);

        setPrevCity(city);
        saveSearch(city);
      } catch (err) {
        setError("Error fetching weather data");
      }
      setLoading(false);
    };

    fetchWeatherForCity();
  }, [city]);

  const RECENT_SEARCHES_KEY = 'recentSearches';
  const MAX_SEARCHES = 5;
  const [recentSearches, setRecentSearches] = useState([]);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
    setRecentSearches(stored);
  }, []);

  const saveSearch = (term) => {
    const filtered = recentSearches.filter(item => item !== term);
    const updated = [term, ...filtered].slice(0, MAX_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };


  //API key
  const key = process.env.NEXT_PUBLIC_WEATHER_API;
  // const key =process.env.API_SECRET_KEY;

  const handleSearch = async () => {
    if (search.trim() === '') {
      // alert('Please enter a city name');
      return;
    } else {
      if (prevCity == search) {
        return
      } else {
        setLoading(true)
        await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}`)
          .then(res => res.json())
          .then(data => setData(data))
        //await new Promise(resolve => setTimeout(resolve, 2000));
        setPrevCity(search)
        saveSearch(search)
        await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${key}`)
          .then(res => res.json())
          .then(data => setData5(data))
        setSearch('')
        setLoading(false)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // console.log(search)
  //console.log(data?.cod, data?.name)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex flex-col items-center px-2">
      <div className="w-full max-w-[1024px] bg-blue-200 rounded-3xl shadow-xl p-6 sm:p-10">
        <div className="w-full max-w-[1024px] fixed top-1 left-1/2 px-6 flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4 -translate-x-1/2">
          <h1 className="font-bold text-4xl text-blue-800 tracking-tight font-sans sm:min-w-[300px]">My Weather</h1>
          <div className="relative  w-full">
            <div className="flex items-center border-2 border-blue-700 rounded-2xl bg-white focus-within:shadow-lg">
              <input
                type="text"
                placeholder="Search City"
                ref={inputRef}
                className="p-3 w-full rounded-l-2xl outline-none text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="w-12 h-12 flex justify-center items-center rounded-r-2xl bg-blue-700 hover:bg-blue-800 text-white transition"
                onClick={handleSearch}
                aria-label="Search"
              >
                <FaSearch size={20} />
              </button>
            </div>
            {/* {recentSearches.length > 0 && search.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white border border-blue-200 rounded-b-2xl shadow z-10">
                  {recentSearches.map((item, index) => (
                    <div
                      className="p-2 px-4 border-b last:border-b-0 cursor-pointer hover:bg-blue-50 text-blue-800 text-base"
                      key={index}
                      onClick={() => {
                        setSearch(item);
                        setTimeout(() => handleSearch(), 0);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )} */}
          </div>
        </div>

        {error && <p className="mt-24 sm:mt-10 text-red-600 text-center mb-4">Error: {error}</p>}

        <div className="flex mt-28 sm:mt-8 flex-col items-center">
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-300"></div>
            </div>
          )}
          {!loading && data?.cod == '200' && (
            <div className="w-full max-w-md bg-red-50 rounded-2xl shadow p-6 mb-8 flex flex-col items-center">
              <div className="flex justify-center bg-gray-500 rounded-2xl items-center mb-2">
                {data?.weather[0]?.icon && (
                  <img
                    src={`http://openweathermap.org/img/wn/${data?.weather[0]?.icon}@4x.png`}
                    alt="Weather icon"
                    className="w-24 h-24"
                  />
                )}
              </div>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setInFarenhite(true)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition ${inFarenhite ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-700 hover:bg-blue-50'}`}
                >
                  Fahrenheit
                </button>
                <button
                  onClick={() => setInFarenhite(false)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition ${!inFarenhite ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-700 hover:bg-blue-50'}`}
                >
                  Celsius
                </button>
              </div>
              <div className="w-full flex flex-col gap-2 text-lg">
                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span>{inFarenhite ? `${data?.main?.temp}°F` : `${(data?.main?.temp - 273.15).toFixed(2)}°C`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weather</span>
                  <span className="capitalize">{data?.weather[0]?.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind</span>
                  <span>{data?.wind?.speed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span>{data?.main?.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>City/Country</span>
                  <span>{data?.name}/{data?.sys?.country}</span>
                </div>
              </div>
            </div>
          )}
          {!loading && data && data?.cod !== '200' && (
            <p className="text-center text-red-500 text-lg font-semibold my-6">{data?.message}</p>
          )}
        </div>

        {/* 5 Day Forecast */}
        {data5?.list && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-800 text-center mb-4">5 Day Forecast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {data5.list.map((item, index) => (
                index % 8 === 4 && index <= 36 ? (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      setSelectedForecast(item);
                      setShowModal(true);
                    }}
                  >
                    <span className="text-blue-700 font-semibold mb-1">{item?.dt_txt?.split(' ')[0]}</span>
                    {item?.weather[0]?.icon && (
                      <img
                        src={`http://openweathermap.org/img/wn/${item?.weather[0]?.icon}@2x.png`}
                        alt="Weather icon"
                        className="w-12 h-12 mb-2"
                      />
                    )}
                    <span className="text-lg font-bold">
                      {inFarenhite ? `${item?.main?.temp.toFixed(2)}°F` : `${(item?.main?.temp - 273.15).toFixed(2)}°C`}
                    </span>
                    <span className="capitalize text-sm text-gray-600 mt-1">{item?.weather[0]?.description}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedForecast && (
          <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-blue-800">Weather Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">
                    {selectedForecast?.dt_txt?.split(' ')[0]}
                  </h4>
                  <p className="text-gray-600">
                    {new Date(selectedForecast?.dt_txt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  {selectedForecast?.weather[0]?.icon && (
                    <img
                      src={`http://openweathermap.org/img/wn/${selectedForecast?.weather[0]?.icon}@4x.png`}
                      alt="Weather icon"
                      className="w-32 h-32"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Temperature</span>
                    <span className="text-xl font-bold">
                      {inFarenhite
                        ? `${selectedForecast?.main?.temp.toFixed(2)}°F`
                        : `${(selectedForecast?.main?.temp - 273.15).toFixed(2)}°C`
                      }
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Weather</span>
                    <span className="capitalize">{selectedForecast?.weather[0]?.description}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Feels Like</span>
                    <span>
                      {inFarenhite
                        ? `${selectedForecast?.main?.feels_like.toFixed(2)}°F`
                        : `${(selectedForecast?.main?.feels_like - 273.15).toFixed(2)}°C`
                      }
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Humidity</span>
                    <span>{selectedForecast?.main?.humidity}%</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Wind Speed</span>
                    <span>{selectedForecast?.wind?.speed} m/s</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Pressure</span>
                    <span>{selectedForecast?.main?.pressure} hPa</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Visibility</span>
                    <span>{(selectedForecast?.visibility / 1000).toFixed(1)} km</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-800">Clouds</span>
                    <span>{selectedForecast?.clouds?.all}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page