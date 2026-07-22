import type { Country } from "../../types/country";
import RankingRow from "./RankingRow";

type Props = {
    teams: Country[];
};

export default function RankingsTable({ teams }: Props) {
    return (
        <table className="w-full">
            <tbody>
                {teams.map((team, index) => (
                    <RankingRow
                        key={team.id}
                        team={team}
                        rank={index + 1}
                    />
                ))}
            </tbody>
        </table>
    );
}