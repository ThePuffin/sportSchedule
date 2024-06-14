import React from 'react';
import { readableDate } from '../../../../utils/date.js';
import { dateSelected } from '../../../../store/store.js';

export default function DatePickerSelector() {
  let { beginingDate, finishingDate, endSeason } = dateSelected.get();

  const changeDate = (target) => {
    // console.log('target.value', target.value);

    if (target.id === 'startDatePicker') {
      beginingDate = new Date(target.value);
    } else {
      finishingDate = new Date(target.value);
    }
    if (beginingDate > finishingDate) {
      finishingDate = new Date(beginingDate);
      finishingDate.setDate(finishingDate.getDate() + 7);
    }
    finishingDate = finishingDate <= endSeason ? finishingDate : endSeason;
    dateSelected.set(endSeason, beginingDate, finishingDate);
  };

  return (
    <div>
      <input
        type="date"
        onChange={(e) => changeDate(e.target)}
        id="startDatePicker"
        min={readableDate(new Date())}
        max={readableDate(endSeason)}
        name="trip-start"
        placeholder={readableDate(beginingDate)}
      />
      <input
        type="date"
        onChange={(e) => changeDate(e.target)}
        id="endDatePicker"
        min={readableDate(beginingDate)}
        max={readableDate(endSeason)}
        value={readableDate(finishingDate)}
        name="trip-end"
      />
      <input type="submit" value="Ok" onClick={() => console.log(beginingDate, '<', finishingDate)} />
    </div>
  );
}
