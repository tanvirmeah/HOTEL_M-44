import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MinibarSales.css'

const MinibarSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
    const [searchText, setSearchText] = useState(''); // State for search term
  const navigate = useNavigate();

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const allSales = [];

    // Extract minibar sales from each booking
    storedBookings.forEach(booking => {
      if (booking.minibarItems && Object.keys(booking.minibarItems).length > 0) {
        const bookingDate = booking.bookingDetails[0]?.checkInDate; // Assuming check-in date
        for (const itemId in booking.minibarItems) {
          const quantity = booking.minibarItems[itemId];
          allSales.push({
            itemId,
            quantity,
            bookingDate,
            reservationId: booking.reservationId,
          });
        }
      }
    });

    // Fetch minibar item details (name, price)
    const minibarItems = JSON.parse(localStorage.getItem('minibarItems')) || [];
    const salesWithDetails = allSales.map(sale => {
      const item = minibarItems.find(i => i.id === sale.itemId);
      return {
        ...sale,
        name: item ? item.name : 'Unknown Item',
        price: item ? item.price : 0,
        category: item ? item.category : 'Unknown'
      };
    });

    setSalesData(salesWithDetails);

    // Set the current month and year as default
    const today = new Date();
    setSelectedYear(String(today.getFullYear()));
    setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0')); // Month is 0-indexed
  }, []);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

    // Filter sales data based on selected month and year AND search text
    const filteredSales = salesData.filter(sale => {
        if (selectedMonth && selectedYear) {
            const saleYear = sale.bookingDate.substring(0, 4);
            const saleMonth = sale.bookingDate.substring(5, 7);
            if (saleYear !== selectedYear || saleMonth !== selectedMonth) {
                return false; // Exclude if year/month doesn't match
            }
        }

        // Apply search text filtering
        const searchLower = searchText.toLowerCase();
        return (
            sale.name.toLowerCase().includes(searchLower) ||
            sale.reservationId.toLowerCase().includes(searchLower) ||
            sale.bookingDate.toLowerCase().includes(searchLower)
        );
    });

  // Calculate total sales value and total items sold
  const totalSalesValue = filteredSales.reduce((total, sale) => {
    return total + (sale.price * sale.quantity);
  }, 0);

  const totalItemsSold = filteredSales.reduce((total, sale) => {
    return total + sale.quantity;
  }, 0);

  // Find best-selling item (Optional - you can expand on this)
  let bestSellingItem = '';
  if (filteredSales.length > 0) {
    const itemCounts = {};
    filteredSales.forEach(sale => {
      itemCounts[sale.name] = (itemCounts[sale.name] || 0) + sale.quantity;
    });
    bestSellingItem = Object.entries(itemCounts).sort(([, a], [, b]) => b - a)[0][0]; // Sort and get the first item
  }

  // Group sales by reservationId
  const groupedSales = {};
  for (const sale of filteredSales) {
    if (!groupedSales[sale.reservationId]) {
      groupedSales[sale.reservationId] = {
        items: [],
        totalValue: 0,
        date: sale.bookingDate, // Use bookingDate for the group
      };
    }
    groupedSales[sale.reservationId].items.push(`${sale.name} (Qty: ${sale.quantity})`);
    groupedSales[sale.reservationId].totalValue += sale.quantity * sale.price;
  }


  return (
    <div className="minibar-sales">
      <h2>Minibar Sales History</h2>
        <div className="filter-container">
            <div className="month-selector">
                <label>Month: </label>
                <select value={selectedMonth} onChange={handleMonthChange}>
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
            </div>
            <div className="year-selector">
                <label>Year: </label>
                <select value={selectedYear} onChange={handleYearChange}>
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                </select>
            </div>
            <div className="search-container">
                <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                />
                <span className="search-icon">🔍</span>
            </div>
        </div>
      <div className="revenue-cards-container">
        <div className='revenue-cards'>
            <div className="revenue-card">
                <h3>Total Sales (BDT)</h3>
                <p>{totalSalesValue}</p>
            </div>
            <div className="revenue-card">
                <h3>Total Items Sold</h3>
                <p>{totalItemsSold}</p>
            </div>
            {bestSellingItem && (
                <div className="revenue-card">
                    <h3>Best Selling Item</h3>
                    <p>{bestSellingItem}</p>
                </div>
            )}
        </div>
      </div>

      <div className="table-container">
        <table className='minibar-sales-table'>
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Date</th>
              <th>Items Consumed</th>
              <th>Total Value (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSales).map(([reservationId, data]) => (
              <tr key={reservationId}>
                <td>{reservationId}</td>
                <td>{data.date}</td>
                <td>{data.items.join(', ')}</td>
                <td>{data.totalValue}</td>
              </tr>
            ))}
          {/* Total Row */}
          <tr>
            <td colSpan="3"><strong>Total:</strong></td>
            <td><strong>BDT {totalSalesValue}</strong></td>
          </tr>
        </tbody>
        </table>
      </div>
        <button className='print-button' onClick={() => window.print()}>Print</button>
    </div>
  );
};

export default MinibarSales;
