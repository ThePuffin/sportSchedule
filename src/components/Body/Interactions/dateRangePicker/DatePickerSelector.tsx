import { useState } from 'react';
import { dateSelected } from '../../../../store/store.js';
import { readableDate } from '../../../../utils/date.js';
import './DatePickerSelector.css';

export default function DatePickerSelector() {
  let { beginingDate, finishingDate, maxSelectable } = dateSelected.get();
  const [startDate, setStartDate] = useState(beginingDate);
  const [endDate, setEndDate] = useState(finishingDate);

  const changeDate = ({ id, value }) => {
    let newStartDate = startDate;
    let newEndDate = endDate;

    if (id === 'startDatePicker') {
      newStartDate = new Date(value);
    } else {
      newEndDate = new Date(value);
    }

    if (newStartDate > newEndDate) {
      newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + 7);
    }

    newEndDate = newEndDate <= maxSelectable ? newEndDate : maxSelectable;

    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Save the dates in local storage
    localStorage.setItem('startDate', newStartDate.toString());
    localStorage.setItem('endDate', newEndDate.toString());

    dateSelected.set({
      maxSelectable,
      beginingDate: newStartDate,
      finishingDate: newEndDate,
    });
    document.getElementById('endDatePicker').focus();
  };

  return (
    <div className="dateDiv">
      <i className="fa fa-play"></i>
      <input
        className="inputDate"
        type="date"
        onChange={(e) => changeDate(e.target)}
        id="startDatePicker"
        min={readableDate(new Date())}
        max={readableDate(maxSelectable)}
        name="trip-start"
        value={readableDate(startDate)}
      />
      <i className="fa fa-stop"></i>

      <input
        className="inputDate"
        type="date"
        onChange={(e) => changeDate(e.target)}
        id="endDatePicker"
        min={readableDate(beginingDate)}
        max={readableDate(maxSelectable)}
        value={readableDate(finishingDate)}
        name="trip-end"
      />
    </div>
  );
}
