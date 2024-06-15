import { useState } from 'react'
import Select from 'react-select'
import { teamSelected } from '../../../../store/store.js'

export default function Selector({ teamsSelectedIds, activeTeams, i, teamSelectedId }) {
  let teamsId = teamSelected.get()
  if (teamSelected.get().includes(undefined)) {
    teamSelected.set(teamsSelectedIds)
  }

  const teamId = teamSelectedId

  const selectedTeams = teamsSelectedIds.filter((team) => team !== teamId)
  let selectableTeams = activeTeams.filter((team) => !selectedTeams.includes(team.id))

  const teamData = activeTeams.find((team) => team.value === teamId)
  const { label = '' } = teamData
  const [availableTeams, setAvailableTeams] = useState(selectableTeams)

  const changeTeam = async (event) => {
    teamsId = [...teamSelected.get()]
    teamsId[i] = event.value

    teamSelected.set(teamsId)
    const selectedTeams = teamsId.filter((team) => team !== teamId)
    const newAvailableTeams = activeTeams.filter((team) => !selectedTeams.includes(team.id))
    setAvailableTeams(newAvailableTeams) // Update the state
  }

  return (
    <div className="App">
      <Select defaultValue={teamId} placeholder={label} onChange={changeTeam} isSearchable options={availableTeams} />
    </div>
  )
}
