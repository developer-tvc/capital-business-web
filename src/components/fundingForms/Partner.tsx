import 'react-datepicker/dist/react-datepicker.css';

import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { CiMail, CiMobile3 } from 'react-icons/ci';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import home from '../../assets/svg/home.svg';
import city from '../../assets/svg/la_city.svg';
import pin from '../../assets/svg/pin.svg';
import user from '../../assets/svg/user.svg';
import { loanFormCommonStyleConstant } from '../../utils/constants';
import {
  formatDate,
  getStayExcludeDateIntervals,
  lookUpAddressFormatter,
  StayContext
} from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import { FundingFormFieldType } from '../../utils/types';
import AddressLookup from './AddressLookup';
import StayDetailsField from './partnerComponents/StayDetailsField';
import { Roles } from '../../utils/enums';
import store from '../../store';
import date from '../../assets/svg/system-uicons_calendar-date.svg';

const Partner = ({
  currentDirectorIndex,
  currentDirector,
  fieldRenderer,
  partnerType,
  PartnerError
}) => {
  const { methods } = useContext(StayContext);
  const { trigger } = methods;
  const state = store.getState();
  const role = state.auth.user.role;

  useEffect(() => {
    if (PartnerError) {
      trigger();
    }
  }, [PartnerError]);

  // return currentDirector.map(
  // (_, currentDirectorIndex) => {
  const directorConst: FundingFormFieldType[] = [
    {
      type: 'dropdown',
      options: ['Mr', 'Mrs', 'Miss'],
      // label: "Title",
      name: `${partnerType}[${currentDirectorIndex}].title`,
      placeholder: 'Title',
      defaultValue: currentDirector.title,
      icon: () => {
        return <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />;
      }
    },
    {
      type: 'text',
      // label: "FirstName",
      placeholder: 'First Name',
      name: `${partnerType}[${currentDirectorIndex}].first_name`,
      defaultValue: currentDirector.first_name,
      icon: () => {
        return <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />;
      }
    },
    {
      type: 'text',
      // label: "LastName",
      placeholder: 'Last Name',
      name: `${partnerType}[${currentDirectorIndex}].last_name`,
      defaultValue: currentDirector.last_name,
      icon: () => {
        return <img src={user} className="h-5 w-5 rtl:rotate-[270deg]" />;
      }
    },
    {
      type: 'tel',
      // label: "Phone Number",
      name: `${partnerType}[${currentDirectorIndex}].phone_number`,
      placeholder: 'Mobile Number',
      icon: () => {
        return (
          <div>
            <CiMobile3 className="h-5 w-5 rtl:rotate-[270deg]" />
          </div>
        );
      }
    },
    {
      name: `${partnerType}[${currentDirectorIndex}].email`,
      type: 'email',
      // label: "Email",
      placeholder: 'Email',
      icon: () => {
        return (
          <>
            <CiMail className="h-5 w-5 rtl:rotate-[270deg]" />
          </>
        );
      }
    },
    {
      type: 'radioButton',
      // label: "Own Any Other Property",
      name: `${partnerType}[${currentDirectorIndex}].owns_other_property`,
      options: ['Yes', 'No'],
      optionLabelClass: `flex   justify-between  items-center text-[#929292]
           -ml-2 `
    },
    {
      type: 'number',
      // label: "Number of Property Owned",
      name: `${partnerType}[${currentDirectorIndex}].owned_property_count`,
      placeholder: 'Number of property',

      min: 1,
      defaultValue: '1',
      icon: () => {
        return (
          <div>
            <img src={city} className="mb-[2px] h-5 w-5 rtl:rotate-[270deg]" />
          </div>
        );
      }
    },
    {
      name: `${partnerType}[${currentDirectorIndex}].credit_score`,
      type: 'number',
      // label: "Credit score",
      placeholder: 'Credit score',
      icon: () => {
        return (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.394 20.025q-.688-.025-1.309-.357q-.62-.331-1.172-.97q-.904-1.027-1.408-2.526Q3 14.673 3 13.058q0-1.883.701-3.535t1.926-2.877t2.867-1.935T12 4t3.506.714t2.857 1.934t1.926 2.87T21 13.04q0 1.617-.52 3.109t-1.438 2.566q-.584.661-1.196.985q-.611.324-1.296.324q-.354 0-.688-.084q-.335-.083-.67-.25l-1.4-.7q-.415-.208-.877-.312q-.463-.104-.934-.104q-.49 0-.943.104t-.85.312l-1.38.7q-.36.192-.697.275q-.338.084-.717.059m.031-1q.225 0 .463-.05t.462-.175l1.4-.7q.525-.275 1.088-.4t1.137-.125t1.15.125t1.1.4l1.425.7q.225.125.45.175t.45.05q.475 0 .91-.25q.434-.25.86-.75q.8-.95 1.24-2.275t.44-2.744q0-3.35-2.325-5.678T12 5T6.325 7.35T4 13.05q0 1.425.472 2.775T5.75 18.1q.425.5.825.713t.85.212M12 14.5q.633 0 1.066-.434q.434-.433.434-1.066q0-.22-.066-.429q-.067-.21-.18-.39L15.1 9.794q.39.37.671.8t.425.925q.068.189.202.325q.135.137.323.137q.27 0 .403-.226q.134-.226.047-.501q-.558-1.679-1.98-2.716Q13.767 7.5 12 7.5q-1.773 0-3.203 1.038q-1.43 1.037-1.987 2.716q-.087.275.056.5t.394.227q.188 0 .313-.137t.193-.325q.446-1.363 1.614-2.191T12 8.5q.612 0 1.201.18t1.113.505l-1.852 2.398q-.108-.039-.231-.061T12 11.5q-.633 0-1.066.434q-.434.433-.434 1.066t.434 1.066T12 14.5"
              ></path>
            </svg>
          </>
        );
      }
    },
    {
      type: 'date',
      placeholder: 'Credit Score Updated Date',
      name: `${partnerType}[${currentDirectorIndex}].credit_score_updated_at`,
      max: formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) // 60 days ago
    },

    {
      name: `${partnerType}[${currentDirectorIndex}].risk_score`,
      type: 'number',
      // label: "Risk score",
      placeholder: 'Risk score',
      icon: () => {
        return (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.394 20.025q-.688-.025-1.309-.357q-.62-.331-1.172-.97q-.904-1.027-1.408-2.526Q3 14.673 3 13.058q0-1.883.701-3.535t1.926-2.877t2.867-1.935T12 4t3.506.714t2.857 1.934t1.926 2.87T21 13.04q0 1.617-.52 3.109t-1.438 2.566q-.584.661-1.196.985q-.611.324-1.296.324q-.354 0-.688-.084q-.335-.083-.67-.25l-1.4-.7q-.415-.208-.877-.312q-.463-.104-.934-.104q-.49 0-.943.104t-.85.312l-1.38.7q-.36.192-.697.275q-.338.084-.717.059m.031-1q.225 0 .463-.05t.462-.175l1.4-.7q.525-.275 1.088-.4t1.137-.125t1.15.125t1.1.4l1.425.7q.225.125.45.175t.45.05q.475 0 .91-.25q.434-.25.86-.75q.8-.95 1.24-2.275t.44-2.744q0-3.35-2.325-5.678T12 5T6.325 7.35T4 13.05q0 1.425.472 2.775T5.75 18.1q.425.5.825.713t.85.212M12 14.5q.633 0 1.066-.434q.434-.433.434-1.066q0-.22-.066-.429q-.067-.21-.18-.39L15.1 9.794q.39.37.671.8t.425.925q.068.189.202.325q.135.137.323.137q.27 0 .403-.226q.134-.226.047-.501q-.558-1.679-1.98-2.716Q13.767 7.5 12 7.5q-1.773 0-3.203 1.038q-1.43 1.037-1.987 2.716q-.087.275.056.5t.394.227q.188 0 .313-.137t.193-.325q.446-1.363 1.614-2.191T12 8.5q.612 0 1.201.18t1.113.505l-1.852 2.398q-.108-.039-.231-.061T12 11.5q-.633 0-1.066.434q-.434.433-.434 1.066t.434 1.066T12 14.5"
              ></path>
            </svg>
          </>
        );
      }
    },
    {
      type: 'date',

      placeholder: 'Risk Score Updated Date',
      name: `${partnerType}[${currentDirectorIndex}].risk_score_updated_at`,
      // excludeDateIntervals: [
      //   { start: currentDate, end: new Date(8640000000000000) }
      // ],
      max: new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000),
      icon: () => {
        return (
          <div className="-ml-1 w-7 pr-2 text-gray-400">
            <img src={date} />
          </div>
        );
      },
      labelClass: ` -top-3 absolute cursor-text text-sm text-gray-500  start-8 mt-1 
         bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
          peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-sm transition-all `
    }
  ];

  fieldRenderer.updateConstant([
    ...fieldRenderer.getConstant(),
    ...directorConst
  ]);

  // if (`${currentDirector.first_name}${currentDirector.last_name}` ===
  //       partnerSelect
  // ) {
  const { getValues } = useFormContext();
  const payload = getValues();

  payload?.[partnerType]?.forEach(partner => {
    if (partner.credit_score_updated_at)
      partner.credit_score_updated_at = formatDate(
        partner.credit_score_updated_at
      );

    if (partner.risk_score_updated_at)
      partner.risk_score_updated_at = formatDate(partner.risk_score_updated_at);

    partner?.stay?.forEach(stay => {
      if (stay.start_date) stay.start_date = formatDate(stay.start_date);
      if (stay.end_date) stay.end_date = formatDate(stay.end_date);
    });
  });

  return (
    <div key={currentDirectorIndex}>
      <div className="pt-6">
        <div className="grid gap-4 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              {fieldRenderer.renderField(
                `${partnerType}[${currentDirectorIndex}].title`
              )}
            </div>
            <div className="col-span-4">
              {fieldRenderer.renderField(
                `${partnerType}[${currentDirectorIndex}].first_name`
              )}
            </div>
          </div>

          {fieldRenderer.renderField(
            `${partnerType}[${currentDirectorIndex}].last_name`
          )}
        </div>
        <div className="grid gap-4 py-6 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          <div className="relative">
            {fieldRenderer.renderField([
              `${partnerType}[${currentDirectorIndex}].phone_number`
            ])}
          </div>

          <div className="relative">
            {' '}
            {fieldRenderer.renderField([
              `${partnerType}[${currentDirectorIndex}].email`
            ])}
          </div>
        </div>
        {[Roles.Manager, Roles.Admin, Roles.UnderWriter].includes(role) && (
          <div className="grid gap-4 py-3 max-sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            <div className="relative">
              {' '}
              {fieldRenderer.renderField([
                `${partnerType}[${currentDirectorIndex}].credit_score`
              ])}
            </div>
            <div className="relative">
              {' '}
              {fieldRenderer.renderField([
                `${partnerType}[${currentDirectorIndex}].credit_score_updated_at`
              ])}
            </div>
            <div className="relative">
              {' '}
              {fieldRenderer.renderField([
                `${partnerType}[${currentDirectorIndex}].risk_score`
              ])}
            </div>
            <div className="relative">
              {' '}
              {fieldRenderer.renderField([
                `${partnerType}[${currentDirectorIndex}].risk_score_updated_at`
              ])}
            </div>
          </div>
        )}
        <DateRangeSelector
          currentDirectorIndex={currentDirectorIndex}
          fieldRenderer={fieldRenderer}
          partnerType={partnerType}
          PartnerError={PartnerError}
          // currentDirector={currentDirector}
        />

        <div className="my-6 grid grid-cols-1 gap-4 rounded-lg border p-2">
          {' '}
          <div className="flex gap-2 p-1">
            <AiOutlineQuestionCircle size={20} color="1A439A" />
            <a className="text-[14px] font-medium text-black max-sm:text-[10px]">
              {'Own Any Other Property ?'}
            </a>
          </div>{' '}
          <div>
            {' '}
            {fieldRenderer.renderField([
              `${partnerType}[${currentDirectorIndex}].owns_other_property`
            ])}
          </div>{' '}
        </div>

        <OwnedProperty
          currentDirectorIndex={currentDirectorIndex}
          fieldRenderer={fieldRenderer}
          partnerType={partnerType}
        />
      </div>
    </div>
  );
};

export const DateRangeSelector = ({
  fieldRenderer,
  currentDirectorIndex,
  partnerType,
  PartnerError
}) => {
  const { methods } = useContext(StayContext);

  const { setValue, watch, trigger, control, getValues, formState } = methods;

  const { append, replace } = useFieldArray({
    control,
    name: `${partnerType}[${currentDirectorIndex}].stay`
  });

  const [openDirectorIndex, setOpenDirectorIndex] = useState(-1);

  const { showToast } = useToast();

  const dateRangeFields = watch(`${partnerType}[${currentDirectorIndex}].stay`);

  if (dateRangeFields === undefined) {
    const initialData = [
      {
        start_date: null,
        end_date: null,
        address: '',
        pincode: '',
        house_ownership: '',
        excludeDateIntervals: []
      }
    ];
    setValue(`${partnerType}[${currentDirectorIndex}].stay`, initialData, {
      shouldValidate: true
    });
  }

  useEffect(() => {
    if (dateRangeFields.length === 0) {
      append({
        start_date: null,
        end_date: new Date(),
        excludeDateIntervals: []
      });
    }
  }, [dateRangeFields]);

  const toggleAccordion = (currentDirectorIndex: number) => {
    setOpenDirectorIndex(
      openDirectorIndex === currentDirectorIndex ? -1 : currentDirectorIndex
    );
    if (openDirectorIndex === currentDirectorIndex) {
      trigger(`${partnerType}[${currentDirectorIndex}].stay`);
      forceRerender();
    }
  };

  const addDateRange = () => {
    const currentStays = getValues(
      `${partnerType}[${currentDirectorIndex}].stay`
    );
    const lastStayIndex = currentStays.length - 1;
    const previousStartDate = currentStays[lastStayIndex]?.start_date;
    const threeYearsAgo = dayjs().subtract(3, 'years').startOf('day');
    const firstStayStartDate = dayjs(previousStartDate);

    if (!previousStartDate) {
      showToast(`Please check last date`, { type: NotificationType.Error });
      return;
    }
    if (firstStayStartDate.isBefore(threeYearsAgo)) {
      showToast(`Please provide address details for the past three years.`, {
        type: NotificationType.Error
      });
      return;
    }

    // Get the last available stay index
    const lastAvailableIndex = currentStays.length - 1;
    const lastStartDate = currentStays[lastAvailableIndex]?.start_date;

    // Set new start date as the day after the last end date
    const endDate = new Date(lastStartDate);
    endDate.setDate(endDate.getDate() - 1);

    // Append a new stay range to the fields
    append({
      start_date: null,
      end_date: endDate,
      excludeDateIntervals: getStayExcludeDateIntervals(
        currentStays,
        lastAvailableIndex + 1
      )
    });

    // trigger(`${partnerType}[${currentDirectorIndex}].stay`)
  };
  const [refresh, setRefresh] = useState(false);

  const forceRerender = () => {
    setRefresh(prev => !prev);
    setTimeout(() => {
      setRefresh(prev => !prev);
    }, 200);
  };
  const onResetDateRanges = () => {
    const initialData = [
      {
        start_date: null,
        end_date: new Date(),
        address: '',
        pincode: '',
        house_ownership: '',
        excludeDateIntervals: []
      }
    ];

    // Using replace method to reset the fields
    replace(initialData);

    // set the new data and trigger validation
    setValue(`${partnerType}[${currentDirectorIndex}].stay`, initialData, {
      shouldValidate: true
    });
    forceRerender();

    // Trigger the validation manually after the reset
    // setTimeout(() => {
    //   trigger(`${partnerType}`).then(() => {
    //     console.log(watch(), 'fields reset')
    //   })
    // }, 100)
  };

  //value from backend if tis already been filled once

  useEffect(() => {}, [formState.errors]);

  const errorIndex = formState.errors?.[partnerType]?.[currentDirectorIndex]
    ?.stay
    ? Object.keys(
        formState.errors?.[partnerType]?.[currentDirectorIndex]?.stay
      )[0]
    : null;

  console.log(
    PartnerError?.[partnerType]?.[currentDirectorIndex]?.stay,
    'error',
    errorIndex
  );

  if (refresh) return <div>{'Loading..'}</div>;
  return (
    <>
      <div>
        <a className="mb-4 flex flex-wrap px-2 text-[11px] font-medium text-[#1A439A]">
          {
            'please ensure that you provide your previous address(es) for atleast'
          }
          {'the last three years.*'}
        </a>

        {dateRangeFields &&
          dateRangeFields.map((i, index) => (
            <div>
              <div
                className="accordion-title mb-4 flex cursor-pointer items-center justify-between rounded-lg border bg-white p-3"
                onClick={() => toggleAccordion(index)}
              >
                <span
                  className={`accordion flex items-center gap-2 text-[14px] font-semibold ${
                    openDirectorIndex === currentDirectorIndex
                      ? 'text-[#1A439A]'
                      : 'font w-[100%] text-black'
                  } `}
                >
                  <img src={home} className="h-4 w-4 rtl:rotate-[270deg]"></img>
                  {`Address ${
                    i?.start_date != null
                      ? dayjs(i?.start_date).format('DD/MMM/YYYY')
                      : '-'
                  }  -- ${
                    i?.end_date != null
                      ? dayjs(i?.end_date).format('DD/MMM/YYYY')
                      : '-'
                  }`}
                </span>

                <span className="accordion-arrow -ml-4 mb-2">
                  {openDirectorIndex === index ? (
                    <IoIosArrowUp />
                  ) : (
                    <IoIosArrowDown />
                  )}
                </span>
              </div>
              <div className="accordion-content bg-white">
                <div className="container mx-auto flex justify-center">
                  <div className="w-full rounded-lg">
                    <StayDetailsField
                      getValues={getValues}
                      setValue={setValue}
                      trigger={trigger}
                      // fields={fields}
                      watch={watch}
                      partnerType={partnerType}
                      currentDirectorIndex={currentDirectorIndex}
                      control={control}
                      openDirectorIndex={openDirectorIndex}
                      currentDateRange={i}
                      currentStayIndex={index}
                      formState={formState}
                      methods={methods}
                      fieldRenderer={fieldRenderer}
                      forceRerender={forceRerender}
                    />
                  </div>
                </div>
              </div>
              {formState.errors?.[partnerType]?.[currentDirectorIndex]?.stay
                ?.length > 0 &&
              openDirectorIndex != index &&
              parseInt(errorIndex) === index ? (
                <p className={loanFormCommonStyleConstant.date.errorClass}>
                  {'Something wrong ,Please check the details filled'}{' '}
                </p>
              ) : null}
            </div>
          ))}
        {/* no need for new date ranges addition if already filled */}
        <div className="flex items-center gap-2">
          {/* {isDateFilledUptoCurrentDate ? null : ( */}
          <button
            type="button"
            className="rounded bg-green-300 p-2"
            onClick={() => addDateRange()}
          >
            {'Add new Address'}
          </button>
          {/* )} */}

          <button
            type="button"
            className="rounded bg-gray-300 p-2"
            onClick={() => onResetDateRanges()}
          >
            {'Reset Address'}
          </button>
        </div>
      </div>
    </>
  );
};

export const OwnedProperty = ({
  currentDirectorIndex,
  fieldRenderer,
  partnerType
}) => {
  const { methods } = useContext(StayContext);
  const { watch, control, getValues } = methods;
  const { append, remove } = useFieldArray({
    control,
    name: `${partnerType}[${currentDirectorIndex}].owned_property`
  });

  const watchOwnedPropertyCount = watch(
    `${partnerType}[${currentDirectorIndex}].owned_property_count`,
    1
  );
  const watchowns_other_property = watch(
    `${partnerType}[${currentDirectorIndex}].owns_other_property`,
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
        name: `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].pincode`,
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
        name: `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].address`,
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
    const currentDirectorsCount = getValues(
      `${partnerType}[${currentDirectorIndex}].owned_property`
    )?.length;
    if (watchOwnedPropertyCount > watchOwnedPropertyCount) {
      for (let i = currentDirectorsCount; i < watchOwnedPropertyCount; i++) {
        append({ address: '', pincode: '' });
      }
    } else if (watchOwnedPropertyCount < currentDirectorsCount) {
      for (let i = currentDirectorsCount; i > watchOwnedPropertyCount; i--) {
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
                `${partnerType}[${currentDirectorIndex}].owned_property_count`
              ])}
            </div>{' '}
          </div>

          {Array.from(
            {
              length: watchOwnedPropertyCount
            },
            (_, currentDirectorIndex) => currentDirectorIndex
          ).map((_, ind) => {
            return (
              <div>
                <div className="my-4 p-2 text-[14px] font-medium text-black max-sm:text-[10px]">{`Property ${
                  ind + 1
                }`}</div>
                <PartnerOwnedAddress
                  ind={ind}
                  currentDirectorIndex={currentDirectorIndex}
                  fieldRenderer={fieldRenderer}
                  partnerType={partnerType}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Partner;

const PartnerOwnedAddress = ({
  ind,
  currentDirectorIndex,
  fieldRenderer,
  partnerType
}) => {
  {
    const { methods } = useContext(StayContext);
    const [address, setAddress] = useState(undefined);
    const { watch, setValue, trigger, formState } = methods;

    useEffect(() => {
      if (address) {
        const lookedUpData = lookUpAddressFormatter(address);
        setValue(
          `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].pincode`,
          lookedUpData.pincode
        );
        setValue(
          `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].address`,
          lookedUpData.addressText
        );
        trigger('address');
      }
    }, [address]);

    const [ownedPropertyError, setOwnedPropertyError] = useState(null);

    useEffect(() => {
      setOwnedPropertyError(
        formState?.errors?.[partnerType]?.[currentDirectorIndex]
          ?.owned_property?.[ind]
          ? formState?.errors?.[partnerType]?.[currentDirectorIndex]
              ?.owned_property?.[ind]
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
                `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].pincode`,
                ''
              )}
              methods={methods}
              pincodeKey={`${partnerType}[${currentDirectorIndex}].owned_property[${ind}].pincode`}
              error={ownedPropertyError?.pincode}
            />
          </div>
          <div className=" ">
            {fieldRenderer.renderField([
              `${partnerType}[${currentDirectorIndex}].owned_property[${ind}].address`
            ])}
          </div>
        </div>
      </div>
    );
  }
};
