import React, { useState } from 'react';
import './Card.css';

export default function TeamCard({ i, team }) {
  const { label, teamLogo, value } = team;
  return (
    <div>
      <h2>
        {i + 1} <img src={teamLogo} alt={value} /> {label}
      </h2>
    </div>
  );
}
