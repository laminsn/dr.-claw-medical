import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import SparklineChart from "./SparklineChart";

interface KpiCardData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  sparkData: number[];
  icon: LucideIcon;
  color: string;
  sparkColor: string;
}

interface KpiCardsProps {
  cards: KpiCardData[];
}

const KpiCards = ({ cards }: KpiCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} shadow-glow-sm`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                  card.trend === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {card.trend === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">{card.title}</p>
            <SparklineChart data={card.sparkData} color={card.sparkColor} height={32} />
          </motion.div>
        );
      })}
    </div>
  );
};

export { type KpiCardData };
export default KpiCards;
