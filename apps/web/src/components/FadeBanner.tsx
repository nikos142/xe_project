const FadeBanner = ({
  message,
  state,
  duration = 3000,
  onClose,
}: FadeBannerProps) => {
  return (
    <div
      className={`fadeBanner fadeBanner-${state}`}
      role={state === "fail" ? "alert" : "status"}
      style={{ animationDuration: `${duration}ms` }}
      onAnimationEnd={onClose}
    >
      {message}
    </div>
  );
};

export default FadeBanner;

interface FadeBannerProps {
  message: string;
  state: "success" | "fail";
  duration?: number;
  onClose?: () => void;
}
