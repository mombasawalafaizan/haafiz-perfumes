import { Loader2Icon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex h-screen justify-center items-center self-center">
      <Loader2Icon className="w-10 h-10 animate-spin" />
    </div>
  );
};

export default PageLoader;
