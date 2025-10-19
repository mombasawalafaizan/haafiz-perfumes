import { Loader2Icon } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="flex h-screen justify-center items-center self-center">
      <Loader2Icon className="w-10 h-10 animate-spin" />
    </div>
  );
};

export default LoadingPage;
