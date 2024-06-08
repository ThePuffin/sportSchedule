import React from 'react';
import { readableDate } from '../../../utils/date.js';

export default function DateSelector() {
  const dateNow = new Date();
  let startDate = new Date();
  let endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  return (
    <div className="App">
      <input type="date" id="start" name="trip-start" value={readableDate(startDate)} min={dateNow} />
      <input type="date" id="start" name="trip-start" value={readableDate(endDate)} min={dateNow} />
    </div>
  );
}
