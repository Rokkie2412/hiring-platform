import type { LoadingProps } from "./types";

const LoadingLayer = (props: LoadingProps) => {
  const { text="Loading..." } = props;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm z-50">
      <div
        className="w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin"
      />
      {text && (
        <p className="text-black text-lg mt-4 font-medium tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};


export default LoadingLayer;
