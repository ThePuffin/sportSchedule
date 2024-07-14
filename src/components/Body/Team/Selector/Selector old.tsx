import { useState } from 'react';
import Select from 'react-select';
import type { TeamType } from '../../../../interface/team.ts';
import { teamSelected } from '../../../../store/store.js';

export default function Selector({ teamsSelectedIds, activeTeams, i, teamSelectedId }) {
  let teamsId = teamSelected.get();
  if (teamSelected.get().includes(undefined)) {
    teamSelected.set(teamsSelectedIds);
  }

  const teamId = teamSelectedId;

  const selectedTeams = teamsSelectedIds.filter((team: string) => team !== teamId);
  let selectableTeams = activeTeams.filter((team: TeamType) => !selectedTeams.includes(team.id));

  const teamData = activeTeams.find((team: TeamType) => team.value === teamId);
  const { label = '' } = teamData;
  const [availableTeams, setAvailableTeams] = useState(selectableTeams);

  const changeTeam = async (event: { value: string }) => {
    teamsId = [...teamSelected.get()];
    teamsId[i] = event.value;

    teamSelected.set(teamsId);
    const selectedTeams = teamsId.filter((team: string) => team !== teamId);
    const newAvailableTeams = activeTeams.filter((team: TeamType) => !selectedTeams.includes(team.id));
    setAvailableTeams(newAvailableTeams); // Update the state
  };

  return (
    <div className="App">
      <Select defaultValue={teamId} placeholder={label} onChange={changeTeam} isSearchable options={availableTeams} />
    </div>
  );
}
