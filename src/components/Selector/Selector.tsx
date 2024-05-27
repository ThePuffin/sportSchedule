import React from 'react';
import Select from 'react-select';
import { teamSelected } from '../../store/store.js';

export default function Selector({ teamsSelectedIds, activeTeams, i, test }) {
  let teamsId = teamSelected.get();
  const teamId = teamsSelectedIds[i];
  if (teamsId[0] === undefined) {
    teamSelected.set(teamsSelectedIds);
  }

  const teamData = activeTeams.find((team) => team.value === teamId);
  const teamName = teamData?.label ?? '';

  const changeTeam = async (event) => {
    teamsId = [...teamSelected.get()];
    teamsId[i] = event.value;

    teamSelected.set(teamsId);
  };
  const filtredTeam = activeTeams.filter((team) => !teamsSelectedIds.includes(team.value));

  return (
    <div className="App">
      <Select defaultValue={teamId} placeholder={teamName} onChange={changeTeam} isSearchable options={filtredTeam} />
    </div>
  );
}
