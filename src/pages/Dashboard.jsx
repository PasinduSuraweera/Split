import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Dashboard() {
  // Retrieve last used currency from localStorage, default to 'USD' if not found
  const [currency, setCurrency] = useState(() => localStorage.getItem('selectedCurrency') || 'USD');
  const [billAmount, setBillAmount] = useState('');
  const [billImage, setBillImage] = useState(null);
  const [allFriends, setAllFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [message, setMessage] = useState('');
  const [owedAmount, setOwedAmount] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [billsSplit, setBillsSplit] = useState(0);
  const [averageSplit, setAverageSplit] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [potentialFriends, setPotentialFriends] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [filterFriend, setFilterFriend] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const conversionRate = 300; // Approximate 1 USD = 300 LKR as of June 2025

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const [friendsResp, potentialResp, historyResp, statsResp] = await Promise.all([
          axios.get('http://localhost:5000/api/friends', { headers: { 'x-auth-token': token } }),
          axios.get('http://localhost:5000/api/friends/search', { headers: { 'x-auth-token': token }, params: { query: '' } }),
          axios.get('http://localhost:5000/api/bills/history', { headers: { 'x-auth-token': token } }),
          axios.get('http://localhost:5000/api/bills/stats', { headers: { 'x-auth-token': token } }),
        ]);
        if (friendsResp.data.success) setAllFriends(friendsResp.data.friends);
        if (potentialResp.data.success) setPotentialFriends(potentialResp.data.friends);
        if (historyResp.data.success) setBillHistory(historyResp.data.bills);
        if (statsResp.data.success) {
          setTotalSpent(parseFloat(statsResp.data.totalSpent));
          setBillsSplit(statsResp.data.billsSplit);
          setAverageSplit(parseFloat(statsResp.data.averageSplit));
        }
      } catch (err) {
        setMessage('Failed to load data: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current && billHistory.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance) chartInstance.destroy();
      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: billHistory.map(bill => new Date(bill.createdAt).toLocaleDateString()),
          datasets: [{
            label: `Total Spent (${currency})`,
            data: billHistory.map((_, index) => {
              const cumulative = billHistory.slice(0, index + 1).reduce((sum, bill) => sum + bill.splitAmount, 0);
              return currency === 'LKR' ? (cumulative * conversionRate).toFixed(2) : cumulative.toFixed(2);
            }),
            borderColor: 'rgba(6, 182, 212, 1)',
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: `Total Spent (${currency})` } },
            x: { title: { display: true, text: 'Date' } },
          },
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false },
          },
        },
      });
      setChartInstance(newChartInstance);
    }
  }, [billHistory, currency]);

  useEffect(() => {
    // Save the selected currency to localStorage whenever it changes
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const handleImageUpload = (e) => {
    setBillImage(e.target.files[0]);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/friends/search', {
          headers: { 'x-auth-token': token },
          params: { query },
        });
        if (response.data.success) {
          setPotentialFriends(response.data.friends.filter(f => !allFriends.some(af => af.email === f.email)));
        }
      } catch (err) {
        setMessage('Failed to search friends: ' + (err.response?.data?.message || err.message));
        console.error('Error searching friends:', err);
      }
    } else {
      setPotentialFriends([]);
    }
  };

  const handleSelectFriend = (friend) => {
    setNewFriendEmail(friend.email);
    setSearchQuery(friend.email); // Fill search bar with selected email
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (newFriendEmail && !allFriends.some(f => f.email === newFriendEmail)) {
      const friend = potentialFriends.find(f => f.email === newFriendEmail);
      if (friend && friend.name && friend.email) {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.post('http://localhost:5000/api/friends/add', { email: newFriendEmail }, {
            headers: { 'x-auth-token': token },
          });
          if (response.data.success) {
            const updatedResponse = await axios.get('http://localhost:5000/api/friends', {
              headers: { 'x-auth-token': token },
            });
            if (updatedResponse.data.success) setAllFriends(updatedResponse.data.friends);
            setNewFriendEmail('');
            setSearchQuery('');
            setMessage('Friend added successfully!');
          }
        } catch (err) {
          setMessage('Failed to add friend: ' + (err.response?.data?.message || 'Server error'));
        }
      } else {
        setMessage('Invalid friend data');
      }
    } else if (allFriends.some(f => f.email === newFriendEmail)) {
      setMessage('Friend already added');
    }
  };

  const handleSplitBill = async (e) => {
    e.preventDefault();
    if (!billAmount || selectedFriends.length === 0) {
      setMessage('Please enter bill amount and select at least one friend.');
      return;
    }
    const amountPerPerson = (parseFloat(billAmount) / (selectedFriends.length + 1)).toFixed(2);
    try {
      const formData = new FormData();
      formData.append('billImage', billImage);
      formData.append('amount', billAmount);
      formData.append('friends', JSON.stringify(selectedFriends.map(f => f.email)));
      formData.append('splitAmount', amountPerPerson);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/bills/split', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
      });
      const newTotalSpent = (parseFloat(totalSpent) + parseFloat(amountPerPerson)).toFixed(2);
      const newBillsSplit = billsSplit + 1;
      const newAverageSplit = ((parseFloat(averageSplit) * billsSplit + parseFloat(amountPerPerson)) / newBillsSplit).toFixed(2);
      setTotalSpent(parseFloat(newTotalSpent));
      setBillsSplit(newBillsSplit);
      setAverageSplit(parseFloat(newAverageSplit));
      setMessage(`Bill split successfully!`);
      setOwedAmount(amountPerPerson);
      setBillAmount('');
      setBillImage(null);
      setSelectedFriends([]);
      const [historyResp, statsResp] = await Promise.all([
        axios.get('http://localhost:5000/api/bills/history', { headers: { 'x-auth-token': token } }),
        axios.get('http://localhost:5000/api/bills/stats', { headers: { 'x-auth-token': token } }),
      ]);
      if (historyResp.data.success) setBillHistory(historyResp.data.bills);
      if (statsResp.data.success) {
        setTotalSpent(parseFloat(statsResp.data.totalSpent));
        setBillsSplit(statsResp.data.billsSplit);
        setAverageSplit(parseFloat(statsResp.data.averageSplit));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to split bill');
    }
  };

  const closeModal = () => {
    setOwedAmount(null);
  };

  const toggleSelectFriend = (friend) => {
    setSelectedFriends(prev =>
      prev.some(f => f.email === friend.email)
        ? prev.filter(f => f.email !== friend.email)
        : [...prev, friend]
    );
  };

  const removeFriend = async (friendToRemove) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete('http://localhost:5000/api/friends/remove', {
        headers: { 'x-auth-token': token },
        data: { friendEmail: friendToRemove.email },
      });
      if (response.data.success) {
        setAllFriends(allFriends.filter(f => f.email !== friendToRemove.email));
        setSelectedFriends(selectedFriends.filter(f => f.email !== friendToRemove.email));
        setMessage(`Removed ${friendToRemove.name || 'Unknown'} from friends list`);
        const statsResp = await axios.get('http://localhost:5000/api/bills/stats', { headers: { 'x-auth-token': token } });
        if (statsResp.data.success) {
          setTotalSpent(parseFloat(statsResp.data.totalSpent));
          setBillsSplit(statsResp.data.billsSplit);
          setAverageSplit(parseFloat(statsResp.data.averageSplit));
        }
      }
    } catch (err) {
      setMessage('Error removing friend: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const filteredFriends = potentialFriends.length > 0 ? potentialFriends : [];

  const sortedHistory = [...billHistory].sort((a, b) => {
    switch (sortOption) {
      case 'dateDesc': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'highest': return b.amount - a.amount;
      case 'lowest': return a.amount - b.amount;
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const filteredHistory = filterFriend
    ? sortedHistory.filter(bill => bill.friends && bill.friends.includes(filterFriend))
    : sortedHistory;

  const getFriendName = (email) => {
    const friend = allFriends.find(f => f.email === email);
    return friend ? `${friend.name} (${email})` : email;
  };

  const handleDeleteBill = async (billId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete('http://localhost:5000/api/bills/delete', {
        headers: { 'x-auth-token': token },
        data: { billId },
      });
      if (response.data.success) {
        setMessage('Bill deleted successfully!');
        const [historyResp, statsResp] = await Promise.all([
          axios.get('http://localhost:5000/api/bills/history', { headers: { 'x-auth-token': token } }),
          axios.get('http://localhost:5000/api/bills/stats', { headers: { 'x-auth-token': token } }),
        ]);
        if (historyResp.data.success) setBillHistory(historyResp.data.bills);
        if (statsResp.data.success) {
          setTotalSpent(parseFloat(statsResp.data.totalSpent));
          setBillsSplit(statsResp.data.billsSplit);
          setAverageSplit(parseFloat(statsResp.data.averageSplit));
        }
      }
    } catch (err) {
      setMessage('Error deleting bill: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  // Format amount based on currency without additional conversion
  const formatAmount = (amount) => {
    const value = parseFloat(amount);
    return currency === 'LKR' ? `Rs. ${value.toFixed(2)}` : `$${value.toFixed(2)}`;
  };

  // Format split amount based on currency
  const formatSplitAmount = (amount, isSplit = false) => {
    const value = parseFloat(amount);
    return currency === 'LKR' ? `Rs. ${value.toFixed(2)}` : `$${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-hidden relative">
      {/* Enhanced Title Centered */}
      <div className="h-12"></div>
      <section id="home" className="px-4 text-center relative">
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-4 animate-pulse-slow" role="heading" aria-level="1">
              Sp/it
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-3 max-w-2xl mx-auto animate-fade-in" role="doc-subtitle">
              Intelligent Bill Splitting Redefined
            </p>
            <p className="text-sm md:text-base text-gray-500 mb-8 max-w-prose mx-auto animate-fade-in-delay">
              Streamline group expenses, settle debts effortlessly, and gain insights.
           </p>
        </div>
      </section>
      {/* Spacer */}
      <div className="h-5"></div>

      {/* Search and Add Friend on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex justify-end items-center">
        <div className="flex items-center space-x-0">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name or email"
              className="w-80 h-10 p-4 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-gray-900/50 text-white"
            />
            {searchQuery.length > 0 && potentialFriends.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-800/70 backdrop-blur-sm border border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                {potentialFriends.map((friend, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-700/50 cursor-pointer text-gray-300"
                    onClick={() => handleSelectFriend(friend)}
                  >
                    {`${friend.name} (${friend.email})`}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAddFriend}
            className="bg-[var(--color-primary)]/80 backdrop-blur-sm text-white font-medium h-10 py-2 px-6 rounded-r-xl shadow-md hover:bg-[var(--color-secondary)]/80 hover:scale-105 transition-all duration-300"
            disabled={!newFriendEmail}
          >
            Add
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combined Your Stats and Bill & Split */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-400">{formatAmount(totalSpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Bills Split</p>
              <p className="text-2xl font-bold text-gray-400 ">{billsSplit}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Avg. Split</p>
              <p className="text-2xl font-bold text-gray-400">{formatAmount(averageSplit)}</p>
            </div>
          </div>
          <hr className="my-6 border-t-2 border-gray-700" />
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Bill & Split</h2>
          <div className="space-y-5">
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder={`Enter bill amount in ${currency}`}
              className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-900/50 text-white"
            />
            <div className="text-sm text-gray-500 mb-2">Select friends to split with:</div>
            <div className="flex flex-wrap gap-3 mb-4">
              {allFriends.map((friend, index) => (
                <div key={index} className="flex items-center bg-gray-900/70 p-2 rounded-lg">
                  <span className="text-sm text-gray-300 truncate">{`${friend.name} (${friend.email})`}</span>
                  <input
                    type="checkbox"
                    checked={selectedFriends.some(f => f.email === friend.email)}
                    onChange={() => toggleSelectFriend(friend)}
                    className="ml-2 h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSplitBill}
              className="w-full bg-[var(--color-primary)]/80 backdrop-blur-sm text-white font-medium py-2 rounded-xl shadow-md hover:bg-[var(--color-secondary)]/80 hover:scale-105 transition-all duration-300"
              disabled={!billAmount || selectedFriends.length === 0}
            >
              Split Bill ({formatSplitAmount(billAmount ? parseFloat(billAmount) / (selectedFriends.length + 1) : 0, true)} per person)
            </button>
          </div>
        </div>

        {/* Spending Trend */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Spending Trend</h2>
          <div className="relative h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* My Friends List */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">My Friends List</h2>
          <div className="space-y-4">
            {allFriends.length > 0 ? (
              allFriends.map((friend, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-900/70 p-2 rounded-lg">
                  <span className="text-sm text-gray-300">{`${friend.name} (${friend.email})`}</span>
                  <button
                    onClick={() => removeFriend(friend)}
                    className="text-red-400 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No friends added yet.</p>
            )}
          </div>
        </div>

        {/* Bill History */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Bill History</h2>
          <div className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <select
                value={filterFriend}
                onChange={(e) => setFilterFriend(e.target.value)}
                className="w-1/2 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-900/50 text-white"
              >
                <option value="">All Friends</option>
                {allFriends.map((friend) => (
                  <option key={friend.email} value={friend.email}>
                    {friend.name} ({friend.email})
                  </option>
                ))}
              </select>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-1/2 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-900/50 text-white"
              >
                <option value="dateDesc">Date (Newest First)</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((bill, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start p-2 bg-gray-900/70 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-300">Amount: {formatAmount(bill.amount)}</p>
                    <p className="text-sm text-gray-300">Split: {formatSplitAmount(bill.splitAmount, true)} per person</p>
                    <p className="text-xs text-gray-500">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                    {bill.friends && bill.friends.length > 0 && (
                      <p className="text-xs text-gray-500">Friends: {bill.friends.map(f => getFriendName(f)).join(', ')}</p>
                    )}
                  </div>
                  {bill.imageUrl && (
                    <a href={bill.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] text-xs mt-1 sm:mt-0">
                      View Image
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteBill(bill._id)}
                    className="text-red-400 hover:text-red-500 text-xs mt-1 sm:mt-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No bills matching the filter.</p>
            )}
          </div>
        </div>
      </div>

      {/* Currency Switch */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex justify-end">
        <button
          onClick={() => setCurrency(currency === 'USD' ? 'LKR' : 'USD')}
          className="bg-[var(--color-primary)]/80 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-xl shadow-md hover:bg-[var(--color-secondary)]/80 hover:scale-105 transition-all duration-300"
        >
          Continue with {currency === 'USD' ? 'LKR' : 'USD'}
        </button>
      </div>

      {/* Owed Amount Modal */}
      {owedAmount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-200 mb-3">Owed Amount</h2>
            <p className="text-2xl font-bold text-gray-300 mb-4">{formatSplitAmount(owedAmount, true)} per person</p>
            <button
              onClick={closeModal}
              className="w-full bg-red-500/80 backdrop-blur-sm text-white font-medium py-2 rounded-xl shadow-md hover:bg-red-600/80 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && <p className="fixed bottom-4 right-4 bg-[var(--color-primary)]/80 backdrop-blur-sm text-white p-2 rounded-xl shadow-md animate-fade-in">{message}</p>}
    </div>
  );
}

// Add Chart.js CDN and minimal animations
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
script.async = true;
document.body.appendChild(script);

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.5s ease-out; }
  @keyframes pulseSlow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .animate-pulse-slow { animation: pulseSlow 3s infinite; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Define CSS variables for colors (matching your homepage)
const styleVars = document.createElement('style');
styleVars.textContent = `
  :root {
    --color-primary: #10b981; /* Teal-like green */
    --color-secondary: #3b82f6; /* Blue */
  }
`;
document.head.appendChild(styleVars);

export default Dashboard;