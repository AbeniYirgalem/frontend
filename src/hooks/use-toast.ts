import toast from "react-hot-toast";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastOptions) => {
      const message = description ? `${title}\n${description}` : title;
      if (variant === "destructive") {
        toast.error(message);
      } else {
        toast.success(message);
      }
    },
  };
}
