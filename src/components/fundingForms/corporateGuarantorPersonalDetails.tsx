import 'react-datepicker/dist/react-datepicker.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { CiMail, CiMobile3 } from 'react-icons/ci';
import city from '../../assets/svg/la_city.svg';
import user from '../../assets/svg/user.svg';
import {
  lookUpAddressFormatter,
  StayContext
} from '../../utils/helpers';
import AddressLookup from './AddressLookup';
import useToast from '../../utils/hooks/toastify/useToast';
import { NotificationType } from '../../utils/hooks/toastify/enums';

interface CorporateGuarantorPersonalDetailsProps {
  currentDirectorIndex: number;
  currentDirector: any;
  fieldRenderer?: any;
  partnerType: string;
  PartnerError?: any;
}

const CorporateGuarantorPersonalDetails: React.FC<CorporateGuarantorPersonalDetailsProps> = ({
  currentDirectorIndex,
  currentDirector,
  partnerType,
  PartnerError
}) => {
  const { methods } = useContext(StayContext);
  const { trigger, formState, watch, setValue, control } = methods;
  const { showToast } = useToast();

  const directorsInitializedRef = useRef(false);

  useEffect(() => {
    if (PartnerError) {
      trigger();
    }
  }, [PartnerError, trigger]);

  const {
    fields: directors,
    append,
    remove,
    replace
  } = useFieldArray({
    control: methods.control,
    name: `${partnerType}[${currentDirectorIndex}].directors`
  });

  useEffect(() => {
    if (
      currentDirector?.directors?.length > 0 &&
      !directorsInitializedRef.current
    ) {
      replace(currentDirector.directors);
      directorsInitializedRef.current = true;
    } else if (
      directors.length === 0 &&
      !directorsInitializedRef.current
    ) {
      replace([
        {
          title: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          email: ''
        }
      ]);
      directorsInitializedRef.current = true;
    }
  }, [currentDirector, replace, directors.length]);

  const handleAddDirector = () => {
    if (directors.length >= 2) {
      showToast('Only 2 directors allowed', {
        type: NotificationType.warning
      });
      return;
    }
    append({
      title: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      email: ''
    });
  };

  const [companyName, setCompanyName] = useState<any>(undefined);
  useEffect(() => {
    if (companyName) {
      const lookedUpData = lookUpAddressFormatter(companyName);
      const companyBasePath = `${partnerType}[${currentDirectorIndex}]`;
      setValue(
        `${companyBasePath}.company_name`,
        lookedUpData.Company_Name || companyName.Company_Name || ''
      );
      setValue(
        `${companyBasePath}.company_number`,
        lookedUpData.Company_Number || companyName.Company_Number || ''
      );

      let addressLine = '';
      let postCode = '';

      if (
        typeof companyName.Company_Address === 'object' &&
        companyName.Company_Address !== null
      ) {
        addressLine = companyName.Company_Address.address_line || '';
        postCode = companyName.Company_Address.post_code || '';
      } else if (typeof companyName.Company_Address === 'string') {
        addressLine = companyName.Company_Address;
      }

      if (typeof addressLine === 'string') {
        addressLine = addressLine.replace(/^["']|["']$/g, '').trim();
      }
      if (typeof postCode === 'string') {
        postCode = postCode.replace(/^["']|["']$/g, '').trim();
      }

      if (addressLine) {
        setValue(
          `${companyBasePath}.registered_address.address_line`,
          addressLine
        );
      }
      if (postCode) {
        setValue(
          `${companyBasePath}.registered_address.post_code`,
          postCode
        );
      }

      trigger([
        `${companyBasePath}.company_name`,
        `${companyBasePath}.company_number`,
        `${companyBasePath}.registered_address.address_line`,
        `${companyBasePath}.registered_address.post_code`
      ]);
    }
  }, [companyName, currentDirectorIndex, partnerType, setValue, trigger]);

  return (
    <div key={currentDirectorIndex}>
      <div className="pt-2">
        {/* Company Details Inputs */}
        <div className="grid gap-4 py-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {/* Company Name Lookup */}
          <div>
            <AddressLookup
              setAddress={setCompanyName}
              value={watch(
                `${partnerType}[${currentDirectorIndex}].company_name`
              )}
              methods={methods}
              pincodeKey={`${partnerType}[${currentDirectorIndex}].company_name`}
              error={
                formState.errors?.[partnerType]?.[currentDirectorIndex]
                  ?.company_name
              }
              isCompanyLookup={true}
            />
          </div>

          {/* Company Number */}
          <div>
            <Controller
              name={`${partnerType}[${currentDirectorIndex}].company_number`}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="relative bg-inherit">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Company Number *"
                    {...field}
                    value={field.value ?? ''}
                    className={`w-full rounded-lg border ${
                      formState.errors?.[partnerType]?.[currentDirectorIndex]
                        ?.company_number
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
              )}
            />
            {formState.errors?.[partnerType]?.[currentDirectorIndex]
              ?.company_number && (
              <p className="mt-1 text-[10px] text-red-500">
                {
                  formState.errors[partnerType][currentDirectorIndex]
                    .company_number.message
                }
              </p>
            )}
          </div>

          {/* Postcode Address Lookup */}
          <div>
            <AddressLookup
              setAddress={addr => {
                const lookedUp = lookUpAddressFormatter(addr);
                methods.setValue(
                  `${partnerType}[${currentDirectorIndex}].registered_address.address_line`,
                  lookedUp.addressText
                );
                methods.setValue(
                  `${partnerType}[${currentDirectorIndex}].registered_address.post_code`,
                  lookedUp.pincode
                );
                methods.trigger([
                  `${partnerType}[${currentDirectorIndex}].registered_address.address_line`,
                  `${partnerType}[${currentDirectorIndex}].registered_address.post_code`
                ]);
              }}
              value={methods.watch(
                `${partnerType}[${currentDirectorIndex}].registered_address.post_code`,
                ''
              )}
              methods={methods}
              pincodeKey={`${partnerType}[${currentDirectorIndex}].registered_address.post_code`}
              error={
                methods.formState?.errors?.[partnerType]?.[currentDirectorIndex]
                  ?.registered_address?.post_code
              }
            />
          </div>

          {/* Company Address */}
          <div>
            <Controller
              name={`${partnerType}[${currentDirectorIndex}].registered_address.address_line`}
              control={control}
              defaultValue=""
              render={({ field }) => {
                const displayVal =
                  typeof field.value === 'object' && field.value !== null
                    ? (field.value.address_line || '')
                    : (field.value ?? '');
                return (
                  <div className="relative bg-inherit">
                    <div className="pointer-events-none absolute left-3 top-3 text-gray-400">
                      <img src={city} className="h-5 w-5" />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Company Address *"
                      {...field}
                      value={displayVal}
                      onChange={e => {
                        field.onChange(e.target.value);
                        trigger(
                          `${partnerType}[${currentDirectorIndex}].registered_address.address_line`
                        );
                      }}
                      className={`w-full rounded-lg border ${
                        formState.errors?.[partnerType]?.[currentDirectorIndex]
                          ?.registered_address?.address_line
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } py-2 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                );
              }}
            />
            {formState.errors?.[partnerType]?.[currentDirectorIndex]
              ?.registered_address?.address_line && (
              <p className="mt-1 text-[10px] text-red-500">
                {
                  formState.errors[partnerType][currentDirectorIndex]
                    .registered_address.address_line.message
                }
              </p>
            )}
          </div>

          {/* Trading Name */}
          <div className="lg:col-span-2">
            <Controller
              name={`${partnerType}[${currentDirectorIndex}].trading_name`}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="relative bg-inherit">
                  <div className="pointer-events-none absolute left-3 top-3 text-gray-400">
                    <img src={city} className="h-5 w-5" />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Trading Name *"
                    {...field}
                    value={field.value ?? ''}
                    className={`w-full rounded-lg border ${
                      formState.errors?.[partnerType]?.[currentDirectorIndex]
                        ?.trading_name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } py-2 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                </div>
              )}
            />
            {formState.errors?.[partnerType]?.[currentDirectorIndex]
              ?.trading_name && (
              <p className="mt-1 text-[10px] text-red-500">
                {
                  formState.errors[partnerType][currentDirectorIndex]
                    .trading_name.message
                }
              </p>
            )}
          </div>
        </div>

        {/* Directors Section */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Directors (Up to 2)
            </h3>
            <button
              type="button"
              onClick={handleAddDirector}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 md:text-sm"
            >
              + Add Director
            </button>
          </div>

          {directors.map((director: any, index: number) => {
            const basePath = `${partnerType}[${currentDirectorIndex}].directors[${index}]`;
            const directorErrors =
              formState.errors?.[partnerType]?.[currentDirectorIndex]
                ?.directors?.[index];

            return (
              <div
                key={director.id}
                className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Director {index + 1}
                  </h4>
                  {directors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-2">
                      <Controller
                        name={`${basePath}.title`}
                        control={control}
                        defaultValue={director.title || ''}
                        render={({ field }) => (
                          <div className="relative">
                            <select
                              {...field}
                              value={field.value ?? ''}
                              className={`w-full rounded-lg border ${
                                directorErrors?.title
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            >
                              <option value="">Title</option>
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Miss">Miss</option>
                            </select>
                            {directorErrors?.title && (
                              <p className="mt-1 text-[10px] text-red-500">
                                {directorErrors.title.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="col-span-4">
                      <Controller
                        name={`${basePath}.first_name`}
                        control={control}
                        defaultValue={director.first_name || ''}
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="First Name *"
                              className={`w-full rounded-lg border ${
                                directorErrors?.first_name
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            />
                            {directorErrors?.first_name && (
                              <p className="mt-1 text-[10px] text-red-500">
                                {directorErrors.first_name.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Controller
                      name={`${basePath}.last_name`}
                      control={control}
                      defaultValue={director.last_name || ''}
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="Last Name *"
                            className={`w-full rounded-lg border ${
                              directorErrors?.last_name
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          {directorErrors?.last_name && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {directorErrors.last_name.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <Controller
                      name={`${basePath}.phone_number`}
                      control={control}
                      defaultValue={director.phone_number || ''}
                      render={({ field }) => (
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <CiMobile3 className="h-5 w-5" />
                          </div>
                          <input
                            {...field}
                            value={field.value ?? ''}
                            type="tel"
                            placeholder="Mobile Number *"
                            className={`w-full rounded-lg border ${
                              directorErrors?.phone_number
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          {directorErrors?.phone_number && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {directorErrors.phone_number.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name={`${basePath}.email`}
                      control={control}
                      defaultValue={director.email || ''}
                      render={({ field }) => (
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <CiMail className="h-5 w-5" />
                          </div>
                          <input
                            {...field}
                            value={field.value ?? ''}
                            type="email"
                            placeholder="Email *"
                            className={`w-full rounded-lg border ${
                              directorErrors?.email
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          {directorErrors?.email && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {directorErrors.email.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CorporateGuarantorPersonalDetails;


