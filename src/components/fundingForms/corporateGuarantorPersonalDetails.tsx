import 'react-datepicker/dist/react-datepicker.css';
import { useContext, useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { CiMail, CiMobile3 } from 'react-icons/ci';
import city from '../../assets/svg/la_city.svg';
import user from '../../assets/svg/user.svg';
import {
  // formatDate,
  lookUpAddressFormatter,
  StayContext
} from '../../utils/helpers';
import { FundingFormFieldType } from '../../utils/types';
import AddressLookup from './AddressLookup';
import useToast from '../../utils/hooks/toastify/useToast';
import { NotificationType } from '../../utils/hooks/toastify/enums';
// import store from '../../store';

const CorporateGuarantorPersonalDetails = ({
  currentDirectorIndex,
  currentDirector,
  fieldRenderer,
  partnerType,
  PartnerError
}) => {
  const { methods } = useContext(StayContext);
  const { trigger, formState, watch, setValue } = methods;
  // const state = store.getState();
  // const role = state.auth.user.role;
  const { showToast } = useToast();

  useEffect(() => {
    if (PartnerError) {
      trigger();
    }
  }, [PartnerError]);

  const {
    fields: directors,
    append,
    remove
  } = useFieldArray({
    control: methods.control,
    name: `${partnerType}[${currentDirectorIndex}].directors` // <== important
  });

  useEffect(() => {
    if (currentDirector?.directors?.length > 0 && directors.length === 0) {
      currentDirector.directors.forEach((director, index) => {
        append(director); // pushes the blank structure into RHF state

        // Set each field explicitly
        Object.entries(director).forEach(([key, value]) => {
          methods.setValue(
            `${partnerType}[${currentDirectorIndex}].directors[${index}].${key}`,
            value
          );
        });
      });
    }
  }, [currentDirector, append]);

  const handleAddDirector = () => {
                  if (directors.length >= 2) {
          showToast("Only 2 directors allowed", { type: NotificationType.warning });
          return;
        }
    append({
      company_name: '',
      company_number: '',
      trading_name: '',
      registered_address: {
        address_line: '',
        post_code: ''
      },
      directors: []
    });
  };

  const directorConst: FundingFormFieldType[] = [
    {
      type: 'dropdown',
      options: ['Mr', 'Mrs', 'Miss'],
      name: `${partnerType}[${currentDirectorIndex}].title`,
      placeholder: 'Title',
      defaultValue: currentDirector.title,
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'text',
      placeholder: 'First Name',
      name: `${partnerType}[${currentDirectorIndex}].first_name`,
      defaultValue: currentDirector?.directors?.[0]?.first_name || '',
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'text',
      placeholder: 'Last Name',
      name: `${partnerType}[${currentDirectorIndex}].last_name`,
      defaultValue: currentDirector.last_name,
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'tel',
      name: `${partnerType}[${currentDirectorIndex}].phone_number`,
      placeholder: 'Mobile Number',
      icon: () => <CiMobile3 className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      name: `${partnerType}[${currentDirectorIndex}].email`,
      type: 'email',
      placeholder: 'Email',
      icon: () => <CiMail className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'text',
      placeholder: 'Company Name',
      name: `${partnerType}[${currentDirectorIndex}].company_name`,
      defaultValue: currentDirector?.company_name || '',
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'text',
      placeholder: 'Your Company Number',
      name: `${partnerType}[${currentDirectorIndex}].company_number`,
      defaultValue: currentDirector?.company_number || '',
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'textarea',
      placeholder: 'Company Address',
      name: `${partnerType}[${currentDirectorIndex}].registered_address.address_line`,
      rows: 3,
      defaultValue: currentDirector?.registered_address?.address_line || '',
      icon: () => (
        <div className="w-7 pr-2 text-gray-400">
          <img src={city} />
        </div>
      )
    },
    {
      type: 'textarea',
      placeholder: 'Trading Name ',
      name: `${partnerType}[${currentDirectorIndex}].trading_name`,
      rows: 3,
      defaultValue: currentDirector?.trading_name || '',
      icon: () => (
        <div className="w-7 pr-2 text-gray-400">
          <img src={city} />
        </div>
      )
    }
  ];

  fieldRenderer.updateConstant([
    ...fieldRenderer.getConstant(),
    ...directorConst
  ]);
  useEffect(() => {
    if (currentDirector?.directors?.length > 0 && directors.length === 0) {
      currentDirector.directors.forEach((director, index) => {
        append(director);
        Object.entries(director).forEach(([key, value]) => {
          methods.setValue(
            `${partnerType}[${currentDirectorIndex}].directors[${index}].${key}`,
            value
          );
        });
      });
    }
  }, [currentDirector, append, directors.length]);

  useEffect(() => {
    const companyName = methods.watch(
      `${partnerType}[${currentDirectorIndex}].company_name`
    );
    const companyNumber = methods.watch(
      `${partnerType}[${currentDirectorIndex}].company_number`
    );

    if (companyName || companyNumber) {
      methods.setValue(
        `${partnerType}[${currentDirectorIndex}].company.Company_Name`,
        companyName || ''
      );
      methods.setValue(
        `${partnerType}[${currentDirectorIndex}].company.company_number`,
        companyNumber || ''
      );
      methods.trigger([
        `${partnerType}[${currentDirectorIndex}].company.Company_Name`,
        `${partnerType}[${currentDirectorIndex}].company.company_number`
      ]);
    }
  }, [
    methods.watch(`${partnerType}[${currentDirectorIndex}].company_name`),
    methods.watch(`${partnerType}[${currentDirectorIndex}].company_number`)
  ]);

  const [companyName, setCompanyName] = useState(undefined);
  useEffect(() => {
    if (companyName) {
      const lookedUpData = lookUpAddressFormatter(companyName);
      const companyBasePath = `${partnerType}[${currentDirectorIndex}]`;
      setValue(
        `${companyBasePath}.company_name`,
        lookedUpData.Company_Name || ''
      );
      setValue(
        `${companyBasePath}.company_number`,
        lookedUpData.Company_Number || ''
      );
      trigger([
        `${companyBasePath}.company_name`,
        `${companyBasePath}.company_number`
      ]);
    }
  }, [companyName]);

  return (
    <div key={currentDirectorIndex}>
      <div className="pt-6">
        <div className="grid gap-4 py-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {/* Company Name */}
          <div className="">
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

          {/* {fieldRenderer.renderField(`${partnerType}[${currentDirectorIndex}].company_name`)} */}

          {/* Company Number */}
          <div className="">
            {fieldRenderer.renderField(
              `${partnerType}[${currentDirectorIndex}].company_number`
            )}
          </div>

          {/* Address Lookup */}
          <div className="">
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
          <div className="">
            {fieldRenderer.renderField(
              `${partnerType}[${currentDirectorIndex}].registered_address.address_line`
            )}
          </div>
          <div className="">
            {fieldRenderer.renderField(
              `${partnerType}[${currentDirectorIndex}].trading_name`
            )}
          </div>
          {/* Company Postcode */}
          <div className="">
            {fieldRenderer.renderField(
              `${partnerType}[${currentDirectorIndex}].registered_address.post_code`
            )}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            {/* <h2 className="text-xl font-semibold">Corporate Guarantors</h2> */}
            <button
              type="button"
              onClick={handleAddDirector}
              className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
            >
              + Add Director
            </button>
          </div>
          {directors.map((_director, index) => {
            const basePath = `${partnerType}[${currentDirectorIndex}].directors[${index}]`;

            const directorConst: FundingFormFieldType[] = [
              {
                type: 'dropdown',
                options: ['Mr', 'Mrs', 'Miss'],
                name: `${basePath}.title`,
                placeholder: 'Title',
                icon: () => <img src={user} className="h-5 w-5" />
              },
              {
                type: 'text',
                name: `${basePath}.first_name`,
                placeholder: 'First Name',
                icon: () => <img src={user} className="h-5 w-5" />
              },
              {
                type: 'text',
                name: `${basePath}.last_name`,
                placeholder: 'Last Name',
                icon: () => <img src={user} className="h-5 w-5" />
              },
              {
                type: 'tel',
                name: `${basePath}.phone_number`,
                placeholder: 'Mobile Number',
                icon: () => <CiMobile3 className="h-5 w-5" />
              },
              {
                type: 'email',
                name: `${basePath}.email`,
                placeholder: 'Email',
                icon: () => <CiMail className="h-5 w-5" />
              }
            ];

            fieldRenderer.updateConstant([
              ...fieldRenderer.getConstant(),
              ...directorConst
            ]);

            return (
              <div
                key={index}
                className="mb-6 rounded-md border bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Director {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-2">
                      {fieldRenderer.renderField(`${basePath}.title`)}
                    </div>
                    <div className="col-span-4">
                      {fieldRenderer.renderField(`${basePath}.first_name`)}
                    </div>
                  </div>
                  {fieldRenderer.renderField(`${basePath}.last_name`)}
                </div>

                <div className="grid gap-4 py-6 lg:grid-cols-2">
                  <div>
                    {fieldRenderer.renderField(`${basePath}.phone_number`)}
                  </div>
                  <div>{fieldRenderer.renderField(`${basePath}.email`)}</div>
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

