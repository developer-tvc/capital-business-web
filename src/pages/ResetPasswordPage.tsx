import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm
} from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { resetPasswordAPI } from '../api/userAuthServices';
import { NotificationType } from '../utils/hooks/toastify/enums';
import useToast from '../utils/hooks/toastify/useToast';
import { NewPasswordSchema } from '../utils/Schema';
import { ResetPasswordFormValues } from '../utils/types';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [isValidToken, setIsValidToken] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const resetPasswordMethods = useForm({
    resolver: yupResolver(NewPasswordSchema)
  });

  const {
    handleSubmit: handleResetPasswordSubmit,
    formState: { errors: resetPasswordErrors },
    register: registerResetPassword
  } = resetPasswordMethods;

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
      showToast('Invalid or missing reset token', {
        type: NotificationType.Error
      });
    }
  }, [searchParams, showToast]);

  const onResetPasswordSubmit: SubmitHandler<ResetPasswordFormValues> = async data => {
    try {
      const { password, confirmPassword } = data;

      if (password !== confirmPassword) {
        showToast('Passwords do not match', { type: NotificationType.Error });
        return;
      }

      const response = await resetPasswordAPI({
        password,
        token
      });

      if (response.status_code >= 200 && response.status_code < 300) {
        showToast(response.status_message, { type: NotificationType.Success });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showToast('An unexpected error occurred. Please try again.', {
        type: NotificationType.Error
      });
    }
  };

  const onResetPasswordError: SubmitErrorHandler<ResetPasswordFormValues> = errors => {
    console.error('Reset Password Form Errors:', errors);
    showToast('Please fix the errors in the form', {
      type: NotificationType.Error
    });
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-800 to-blue-500">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
            Invalid Reset Link
          </h2>
          <p className="mb-6 text-center text-gray-600">
            This password reset link is invalid or has expired. Please request a new
            password reset.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-800 to-blue-500">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-md sm:p-8"
      >
        <h2 className="mb-4 text-center text-3xl font-semibold text-gray-800 sm:mb-6 sm:text-4xl">
          Reset Password
        </h2>
        <FormProvider {...resetPasswordMethods}>
          <form
            onSubmit={handleResetPasswordSubmit(
              onResetPasswordSubmit,
              onResetPasswordError
            )}
          >
            <div className="mb-4 sm:mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 sm:text-base"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                {...registerResetPassword('password')}
                className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                placeholder="Enter your new password"
              />
              {resetPasswordErrors.password && (
                <span className="mt-1 text-xs text-red-500 sm:text-sm">
                  {resetPasswordErrors.password.message}
                </span>
              )}
            </div>
            <div className="mb-4 sm:mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 sm:text-base"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...registerResetPassword('confirmPassword')}
                className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                placeholder="Confirm your new password"
              />
              {resetPasswordErrors.confirmPassword && (
                <span className="mt-1 text-xs text-red-500 sm:text-sm">
                  {resetPasswordErrors.confirmPassword.message}
                </span>
              )}
            </div>
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-6 sm:py-3"
              >
                Reset Password
              </motion.button>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
