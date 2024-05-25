import React, { useState } from 'react';

export default function TeamCard({ i, frTeamName }) {
  return (
    <div>
      <h2>
        {i + 1} {frTeamName}{' '}
      </h2>
    </div>
  );
}
