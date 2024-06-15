import { useState } from "react";
import { readableDate } from "../../../utils/date.js";

export default function DateSelector() {
  const dateNow = new Date();
  let startDate = new Date();
  let endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const [start, setStart] = useState(readableDate(startDate));
  const [end, setEnd] = useState(readableDate(endDate));

  const handleStartChange = (event) => {
    setStart(event.target.value);
  };

  const handleEndChange = (event) => {
    setEnd(event.target.value);
  };

  return (
    <div className="App">
      <input
        type="date"
        id="start"
        name="trip-start"
        value={start}
        min={readableDate(dateNow)}
        onChange={handleStartChange}
      />
      <input
        type="date"
        id="end"
        name="trip-end"
        value={end}
        min={readableDate(dateNow)}
        onChange={handleEndChange}
      />
    </div>
  );
}
