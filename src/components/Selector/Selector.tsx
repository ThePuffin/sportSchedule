import React from 'react';
import Select from 'react-select';

export default function Selector({ teamsSelectedIds, activeTeams, i, handleChangeTeam }) {
  const teamId = teamsSelectedIds[i];
  const teamData = activeTeams.find((team) => team.value === teamId);
  const teamName = teamData?.label ?? '';

  const changeTeam = async (event) => {
    await handleChangeTeam({ i, newTeamId: event.value });
  };
  const filtredTeam = activeTeams.filter((team) => !teamsSelectedIds.includes(team.value));

  return (
    <div className="App">
      <Select defaultValue={teamId} placeholder={teamName} onChange={changeTeam} isSearchable options={filtredTeam} />
    </div>
  );
}
