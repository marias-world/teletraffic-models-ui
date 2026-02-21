import { motion } from "framer-motion";

interface ServerProps {
  busy: boolean;
}

export default function Server({ busy }: ServerProps) {
  return (
    <motion.div
      className={`
        flex-1 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] 
        aspect-square rounded-lg border-2 border-slate-400 
        flex items-center justify-center font-bold text-white
        ${busy ? "bg-red-500" : "bg-green-500"}
      `}
      animate={{ scale: busy ? 1.2 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {busy ? "Busy" : "Free"}
    </motion.div>
  );
}