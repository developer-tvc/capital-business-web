import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import { forGotPasswordAPI } from '../../api/userAuthServices';
import emails from '../../assets/svg/oui_email.svg';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import { FogotPasswordSchema } from '../../utils/Schema';
import { ForgotPasswordFormValues } from '../../utils/types';

const ForgotPassword: React.FC<{
  setShowLoginForm: Dispatch<SetStateAction<boolean>>;
}> = ({ setShowLoginForm }) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const { showToast } = useToast();

  const forgotPasswordMethods = useForm({
    resolver: yupResolver(FogotPasswordSchema)
  });

  const {
    handleSubmit: handleForgotPasswordSubmit,
    formState: { errors: forgotPasswordErrors },
    register: registerForgotPassword
  } = forgotPasswordMethods;

  const onForgotPasswordSubmit: SubmitHandler<
    ForgotPasswordFormValues
  > = async data => {
    try {
      const response = await forGotPasswordAPI(data);

      if (response.status_code === 200) {
        setEmailSubmitted(true);
        showToast(response.status_message, { type: NotificationType.Success });
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('An unexpected error occurred. Please try again.', {
        type: NotificationType.Error
      });
    }
  };


  const onForgotPasswordError: SubmitErrorHandler<
    ForgotPasswordFormValues
  > = errors => {
    console.error('Forgot Password Form Errors:', errors);
    Object.values(errors).forEach(error => {
      console.error(error.message);
    });
    showToast('Please fix the errors in the form', {
      type: NotificationType.Error
    });
  };


  return (
    <div>
      {!emailSubmitted ? (
        <FormProvider {...forgotPasswordMethods}>
          <form
            onSubmit={handleForgotPasswordSubmit(
              onForgotPasswordSubmit,
              onForgotPasswordError
            )}
            className="h-[375px]"
          >
            <div className="mb-4 mt-16 rounded-lg bg-white">
              <div className="relative bg-inherit">
                <span className="absolute bottom-3 left-1 px-1 text-[#737373]">
                  <img src={emails} className="h-5 w-5"></img>
                </span>
                <input
                  type="email"
                  id="email"
                  {...registerForgotPassword('email')}
                  className="peer h-12 w-full rounded-lg border border-stone-300 bg-transparent px-8 text-black placeholder-transparent focus:border-gray-500 focus:outline-none"
                  placeholder="Enter your email"
                />
                <label
                  htmlFor="email"
                  className="absolute -top-3 start-8 mx-1 mt-1 cursor-text bg-inherit px-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-gray-600"
                >
                  {'Email'}
                </label>
              </div>
              {forgotPasswordErrors.email && (
                <span className="mt-1 text-xs text-red-500 sm:text-sm">
                  {forgotPasswordErrors.email.message}
                </span>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowLoginForm(true)}
                className="text-xs text-[#1A439A] sm:text-sm"
              >
                {'Back to Login'}
              </button>
            </div>
            <div className="mt-16 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-6 sm:py-3"
              >
                {'Send Reset Email'}
              </motion.button>
            </div>
          </form>
        </FormProvider>
      ) : (
        <div className="flex h-[375px] flex-col items-center justify-center rounded-lg bg-white p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Email Sent Successfully
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            Please check your email for the password reset link. Click the link in
            the email to reset your password.
          </p>
          <button
            onClick={() => setShowLoginForm(true)}
            className="rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
