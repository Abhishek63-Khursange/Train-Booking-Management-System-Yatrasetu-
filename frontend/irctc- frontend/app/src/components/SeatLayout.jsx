import React from 'react';
import './SeatLayout.css';

const SeatLayout = ({ seats, selectedSeats, onSeatSelect }) => {
  if (!seats || seats.length === 0) {
    return <div className="text-center p-3">No seat layout available for this coach.</div>;
  }

  const handleSeatClick = (seat) => {
    if (!seat.available) return;

    const isSelected = selectedSeats.includes(seat.id);
    if (isSelected) {
      onSeatSelect(selectedSeats.filter(id => id !== seat.id));
    } else {
      // Allow selecting up to 6 seats
      if (selectedSeats.length < 6) {
        onSeatSelect([...selectedSeats, seat.id]);
      }
    }
  };

  const renderSeats = () => {
    const rows = [];
    const seatsPerRow = 4;

    for (let i = 0; i < seats.length; i += seatsPerRow) {
      const rowSeats = seats.slice(i, i + seatsPerRow);

      rows.push(
        <div className="seat-row" key={`row-${i / seatsPerRow}`}>
          {rowSeats.map((seat, index) => {
            if (!seat) return null;

            const isSelected = selectedSeats.includes(seat.id);
            // In a 4-seat row, the first and last seats are window seats.
            const isWindow = index === 0 || index === rowSeats.length - 1;

            const seatClass = `seat ${
              isSelected ? 'selected' : seat.available ? 'available' : 'unavailable'
            } ${isWindow && seat.available ? 'window' : ''}`;

            return (
              <div
                key={seat.id}
                className={seatClass}
                onClick={() => handleSeatClick(seat)}
                // This style places seats into columns: 1, 2, skip 3 (aisle), 4, 5
                style={{ gridColumn: index < 2 ? index + 1 : index + 2 }}
              >
                {seat.seatNumber}
              </div>
            );
          })}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="seat-layout-container">
      <div className="seat-map">
        {/* Labels for the top of the grid */}
        <div className="labels-row">
          <div className="label" style={{ gridColumn: 1 }}>Window</div>
          <div className="label" style={{ gridColumn: 2 }}>Aisle</div>
          <div className="label" style={{ gridColumn: 4 }}>Aisle</div>
          <div className="label" style={{ gridColumn: 5 }}>Window</div>
        </div>

        {renderSeats()}
        
        <div className="aisle-col">AISLE</div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box seat available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box seat available window"></div>
          <span>Window</span>
        </div>
        <div className="legend-item">
          <div className="legend-box seat selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box seat unavailable"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
