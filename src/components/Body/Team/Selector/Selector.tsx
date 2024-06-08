import React from 'react';
import Select from 'react-select';
import { teamSelected } from '../../../../store/store.js';

export default function Selector({ teamsSelectedIds, activeTeams, i, teamSelectedId }) {
  let teamsId = teamSelected.get();
  const teamId = teamSelectedId;
  if (teamsId[0] === undefined) {
    teamSelected.set(teamsSelectedIds);
  }

  const teamData = activeTeams.find((team) => team.value === teamId);
  const { label = '', teamLogo } = teamData;

  const changeTeam = async (event) => {
    teamsId = [...teamSelected.get()];
    teamsId[i] = event.value;

    teamSelected.set(teamsId);
  };

  //TODO: to use later to avoid to select same team multi times (linked it to the store or state ???)
  // const filtredTeam = activeTeams.filter(
  //   (team) => !teamsSelectedIds.includes(team.value),
  // );

  return (
    <div className="App">
      <Select defaultValue={teamId} placeholder={label} onChange={changeTeam} isSearchable options={activeTeams} />
    </div>
  );
}
