import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { InfoIcon } from "@/components/ui/icon";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { useCallback, useState } from "react";

export const useForms = (initialState: any, validationRules: any) => {
  const [formData, setFormData] = useState(initialState);
  const [formDataErrors, setFormDataErrors] = useState(initialState);

  const handleInputChange = (key: string) => (value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });

    let errorMessage = "";

    if (value === "") {
      setFormDataErrors({
        ...formDataErrors,
        [key]: {
          message: "",
        },
      });
      return;
    }

    if (!validationRules[key]) {
      return;
    }

    if (validationRules[key]) {
      const validationResult = validationRules[key](value);
      let isValid = validationResult.isValid;
      errorMessage = isValid ? "" : validationResult.message;
    }

    setFormDataErrors({
      ...formDataErrors,
      [key]: {
        message: errorMessage,
      },
    });
  };

  return {
    formData,
    formDataErrors,
    setFormDataErrors,
    handleInputChange,
  };
};

export const useToggle = (initialState: boolean) => {
  const [state, setState] = useState(initialState);

  const handleState = () => {
    setState((state) => !state);
  };

  return {
    state,
    handleState,
  };
};

export const useThrottle = (fn: any, delay: number) => {
  const [isThrottled, setIsThrottled] = useState(false);

  return (...args: any) => {
    if (!isThrottled) {
      fn(...args);
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, delay);
    }
  };
};

export const useShowToast = () => {
  const toast = useToast();

  const showToast = useCallback(
    (message: string, status?: string) => {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => {
          const toastId = "toast-" + id;
          const statusStyle = status === "error" ? "bg-warning-900" : "bg-primary-900";

          return (
            <Toast
              nativeID={toastId}
              className={`px-5 py-3 gap-4 ${statusStyle} items-center flex-row`}
            >
              <ToastTitle size="sm">{message}</ToastTitle>
            </Toast>
          );
        },
      });
    },
    [toast]
  );

  return showToast;
};
