import 'react-datepicker/dist/react-datepicker.css';
import { useContext, useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { CiMail, CiMobile3 } from 'react-icons/ci';
import city from '../../assets/svg/la_city.svg';
import pin from '../../assets/svg/pin.svg';
import user from '../../assets/svg/user.svg';
import {
  // formatDate,
  lookUpAddressFormatter,
  StayContext
} from '../../utils/helpers';
import { FundingFormFieldType } from '../../utils/types';
import AddressLookup from './AddressLookup';
// import store from '../../store';

const CorporateGuarantorPersonalDetails = ({
  currentDirectorIndex,
  currentDirector,
  fieldRenderer,
  partnerType,
  PartnerError
}) => {
  const { methods } = useContext(StayContext);
  const { trigger } = methods;
  // const state = store.getState();
  // const role = state.auth.user.role;

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
  console.log('directors', directors);
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

  console.log('Directors in field array:', directors);
  console.log('Current Director data:', currentDirector);

  const handleAddDirector = () => {
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
  console.log('currentDirector', currentDirector.directors);
  // const someValue = currentDirector.stay[0]
  // return currentDirector.map(
  // (_, currentDirectorIndex) => {

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
      placeholder: 'Business/Shop Name',
      name: `${partnerType}[${currentDirectorIndex}].company_name`,
      defaultValue: currentDirector?.company_name || '',
      icon: () => <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />
    },
    {
      type: 'text',
      placeholder: 'Your Company Number *',
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
      placeholder: 'Business/Shop Name ',
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

  console.log('Form Values:', methods.getValues());
  console.log(
    'company_name watched:',
    methods.watch(`${partnerType}[${currentDirectorIndex}].directors[0].email`)
  );

  return (
    <div key={currentDirectorIndex}>
      <div className="pt-6">
        <div className="grid gap-4 py-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {/* Company Name */}
          <div className="">
            {fieldRenderer.renderField(
              `${partnerType}[${currentDirectorIndex}].company_name`
            )}
          </div>

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

export const OwnedProperty = ({ fieldRenderer }) => {
  const { methods } = useContext(StayContext);
  const { watch, control, getValues } = methods;
  const { append, remove } = useFieldArray({
    control,
    name: `guaranteed_property.owned_property`
  });

  const watchOwnedPropertyCount = watch(
    `guaranteed_property.owned_property_count`,
    1
  );
  console.log('watchOwnedPropertyCount', watchOwnedPropertyCount);

  const watchowns_other_property = watch(
    `guaranteed_property.owns_other_property`,
    'NO'
  );

  useEffect(() => {}, [watchowns_other_property]);

  Array.from(
    {
      length: watchOwnedPropertyCount
    },
    (_, currentDirectorIndex) => currentDirectorIndex
  ).forEach((_, ind) => {
    const ownedOtherPropertyConst: FundingFormFieldType[] = [
      {
        type: 'number',
        // label: "Postcode",
        name: `guaranteed_property.owned_property[${ind}].pincode`,
        placeholder: 'Pincode',
        icon: () => {
          return (
            <div className="w-5 pr-2 text-gray-400">
              <img src={pin} />
            </div>
          );
        }
      },
      {
        // label: "Address",
        type: 'textarea',
        name: `guaranteed_property.owned_property[${ind}].address`,
        rows: 3,
        placeholder: 'Address',
        icon: () => {
          return (
            <div className="w-7 pr-2 text-gray-400">
              <img src={city} />
            </div>
          );
        }
      }
    ];

    fieldRenderer.updateConstant([
      ...fieldRenderer.getConstant(),
      ...ownedOtherPropertyConst
    ]);
  });

  useEffect(() => {
    const currentCount =
      getValues(`guaranteed_property.owned_property`)?.length || 0;

    if (watchOwnedPropertyCount > currentCount) {
      for (let i = currentCount; i < watchOwnedPropertyCount; i++) {
        append({ address: '', pincode: '' });
      }
    } else if (watchOwnedPropertyCount < currentCount) {
      for (let i = currentCount; i > watchOwnedPropertyCount; i--) {
        remove(i - 1);
      }
    }
  }, [watchOwnedPropertyCount, append, remove]);

  return (
    <>
      {watchowns_other_property === 'Yes' && (
        <div>
          <div className="grid grid-cols-1 gap-4">
            {' '}
            <div className="flex gap-2 p-1">
              <AiOutlineQuestionCircle size={20} color="1A439A" />
              <a className="text-[14px] font-medium text-black max-sm:text-[10px]">
                {'Number of property ?'}
              </a>
            </div>
            <div className="">
              {fieldRenderer.renderField([
                `guaranteed_property.owned_property_count`
              ])}
            </div>{' '}
          </div>

          {[...Array(parseInt(watchOwnedPropertyCount))].map((_, ind) => {
            const ownerBase = `guaranteed_property.owned_property[${ind}]`;

            // Add owner_name and owner_email field definitions
            const ownerFields: FundingFormFieldType[] = [
              {
                type: 'text',
                name: `${ownerBase}.owner_name`,
                placeholder: 'Owner Name',
                icon: () => <img src={user} className="h-5 w-5" />
              },
              {
                type: 'email',
                name: `${ownerBase}.owner_email`,
                placeholder: 'Owner Email',
                icon: () => <img src={user} className="h-5 w-5" />
              }
            ];

            fieldRenderer.updateConstant([
              ...fieldRenderer.getConstant(),
              ...ownerFields
            ]);

            return (
              <div key={ind}>
                <div className="my-4 p-2 text-[14px] font-medium text-black max-sm:text-[10px]">
                  {`Owner ${ind + 1}`}
                </div>

                <div className="mb-2 grid gap-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                  <div>
                    {fieldRenderer.renderField(`${ownerBase}.owner_name`)}
                  </div>
                  <div>
                    {fieldRenderer.renderField(`${ownerBase}.owner_email`)}
                  </div>
                </div>

                <PartnerOwnedAddress ind={ind} fieldRenderer={fieldRenderer} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CorporateGuarantorPersonalDetails;

const PartnerOwnedAddress = ({ ind, fieldRenderer }) => {
  {
    const { methods } = useContext(StayContext);
    const [address, setAddress] = useState(undefined);
    const { watch, setValue, trigger, formState } = methods;

    useEffect(() => {
      if (address) {
        const lookedUpData = lookUpAddressFormatter(address);

        setValue(
          `guaranteed_property.owned_property[${ind}].pincode`,
          lookedUpData.pincode
        );
        setValue(
          `guaranteed_property.owned_property[${ind}].address`,
          lookedUpData.addressText
        );

        trigger([
          `guaranteed_property.owned_property[${ind}].pincode`,
          `guaranteed_property.owned_property[${ind}].address`
        ]);
      }
    }, [address]);

    const [ownedPropertyError, setOwnedPropertyError] = useState(null);

    useEffect(() => {
      setOwnedPropertyError(
        formState?.errors?.guaranteed_property?.owned_property?.[ind]
          ? formState?.errors?.guaranteed_property?.owned_property?.[ind]
          : null
      );
    }, [formState]);

    return (
      <div>
        <div className="grid gap-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          <div className="">
            <AddressLookup
              setAddress={setAddress}
              value={watch(
                `guaranteed_property.owned_property[${ind}].pincode`,
                ''
              )}
              methods={methods}
              pincodeKey={`guaranteed_property.owned_property[${ind}].pincode`}
              error={ownedPropertyError?.pincode}
            />
          </div>
          <div className=" ">
            {fieldRenderer.renderField([
              `guaranteed_property.owned_property[${ind}].address`
            ])}
          </div>
        </div>
      </div>
    );
  }
};
