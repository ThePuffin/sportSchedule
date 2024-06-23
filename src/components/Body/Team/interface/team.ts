export interface TeamType {
  value: string;
  id: string;
  label: string;
  teamLogo: string;
  teamCommonName: string;
  conferenceName: string;
  divisionName: string;
}

export interface Props {
  activeTeams: TeamType[];
}
