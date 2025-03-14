import { motion } from "framer-motion";

const MotionButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="bg-black text-white px-4 py-2 rounded-md mx-2 transition-all w-full text-left"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );

  export default MotionButton;