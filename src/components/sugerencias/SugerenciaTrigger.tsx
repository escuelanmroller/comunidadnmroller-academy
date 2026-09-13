import { useState, ReactNode } from "react";
import SugerenciaDialog from "./SugerenciaDialog";

interface Props {
  children: (open: () => void) => ReactNode;
}

const SugerenciaTrigger = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {children(() => setOpen(true))}
      <SugerenciaDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default SugerenciaTrigger;
