interface Props {
    rank: number;
}

export default function RankBadge({ rank }: Props) {
    const className =
        rank === 1
            ? "bg-amber-500 text-slate-950"
            : rank === 2
            ? "bg-slate-300 text-slate-950"
            : rank === 3
            ? "bg-amber-700 text-white" 
            : rank >= 4 && rank <= 10
            ? "bg-blue-700 text-white"
            : "text-slate-400";

    return (
        <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${className}`}
        >
            {rank}
        </span>
    );
}