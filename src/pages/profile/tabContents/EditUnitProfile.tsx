import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RxCross2 } from 'react-icons/rx';
import { TiPencil } from 'react-icons/ti';
import { useSelector } from 'react-redux';
import build from '../../../assets/svg/build.svg';

import {
  companyNameSearchAPI,
  editUnitProfileApi
} from '../../../api/loanServices';
import FieldRenderer from '../../../components/commonInputs/FieldRenderer';
import Loader from '../../../components/Loader';
import { managementSliceSelector } from '../../../store/managementReducer';
import {
  loanFormCommonStyleConstant,
  unitProfileEditDetails
} from '../../../utils/constants';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import { UnitProfileEditSchema } from '../../../utils/Schema';
import { UnitProfileDetails } from '../../../utils/types';

const EditUnitProfile = ({ closeModal, profile, unitId }) => {
  const fieldRenderer = new FieldRenderer(
    unitProfileEditDetails,
    loanFormCommonStyleConstant,
    UnitProfileEditSchema
  );
  const [addressList, setAddressList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [lookupError, setError] = useState(undefined);
  const [inputVale, setInputVale] = useState('');

  const { unit } = useSelector(managementSliceSelector);
  const companyId = unit.id || unitId;
  const { showToast } = useToast();
  const methods = useForm<Partial<UnitProfileDetails>>({
    resolver: yupResolver(UnitProfileEditSchema),
    defaultValues: {
      id: profile?.id || '',
      company_name: profile?.company_name || '',
      company_status: profile?.company_status || '',
      // customer: profile?.customer || "",
      business_type: profile?.business_type || '',
      funding_purpose: profile?.funding_purpose || '',
      trading_style: profile?.trading_style || '',
      company_number: profile?.company_number || '',
      other_funding_purpose: profile?.other_funding_purpose || ''
    }
  });
  const { handleSubmit, getValues, setValue } = methods;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        customers: profile?.gocardless_status,
        gocardless_status: profile?.gocardless_status
      };

      const response = await editUnitProfileApi(companyId, payload);

      if (response.status_code >= 200 && response.status_code < 300) {
        showToast('Profile updated successfully', {
          type: NotificationType.Success
        });
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        showToast(response.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_name) {
      setInputVale(profile?.company_name);
    }
  }, [profile]);

  const onError = error => {
    showToast('Please check the validation error!', {
      type: NotificationType.Error
    });
    console.log('error', error);
  };
  const comapanyLookup = async () => {
    setShowDropDown(true);
    setLoader(true);
    setError(undefined);
    try {
      const result = await companyNameSearchAPI(inputVale);

      if (result.status_code === 200) {
        if (result.data.length > 0) {
          setAddressList(result.data);
          setLoader(false);
        } else {
          setError(result.data.StatusDetails.Description);
        }
      } else if (result.status_code === 422) {
        showToast(result.status_message, { type: NotificationType.Error });
      }
    } catch (err) {
      console.log('err', err);
      setError('something wrong');
      showToast('something wrong!', { type: NotificationType.Error });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (inputVale && getValues('business_type') === 'Limited Company') {
      comapanyLookup();
    } else {
      setShowDropDown(false);
      setLoader(false);
      setError(undefined);
    }
  }, [inputVale, getValues('business_type')]);

  const handleSid = async item => {
    try {
      setLoader(true);
      // setInputVale(item.Company_Name);

      // setInputVale(item.Company_Name);
      // //additionally send company status key to api from lookup directly
      setValue('company_status', item.Company_Status);
      setValue('company_number', item.Company_Number);
      setValue('company_name', item.Company_Name);
      // setValue('company.company_address', item.Company_Address);
      // trigger('company.company_number');

      // setAddress(item);
      setLoader(false);
      setShowDropDown(false);
    } catch (err) {
      console.log(err);
      setError('something wrong');
      setLoader(false);
      setShowDropDown(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
        >
          {isLoading && (
            <div
              aria-hidden="true"
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
            >
              <Loader />
            </div>
          )}
          <div className="relative w-full max-w-md bg-white">
            <div className="flex items-center justify-end px-4 py-6">
              <div className="inline-block h-[46px] w-[46px] rounded-lg bg-[#d5dceb] p-3 text-[#1A439A]">
                <TiPencil size={24} />
              </div>
              <p className="my-1 pl-2 text-[15px] font-medium">
                {'Edit Details'}
              </p>
              <button
                onClick={closeModal}
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-400"
              >
                <RxCross2 size={24} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="px-2 pb-6 text-[#000000]"
              action="#"
            >
              <div className="relative h-[450px] overflow-y-scroll shadow">
                <div className="grid items-center">
                  {/* <div className="w-full py-[2px]">
                    {fieldRenderer.renderField(["image"], {
                      defaultValue: profile?.image,
                    })}
                  </div> */}

                  {/* <div className="grid lg:grid-cols-2 gap-4 p-2 max-sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2">
                    <div className="">
                      {fieldRenderer.renderField(["company_name"], {
                        defaultValue: profile?.company_name,
                      })}
                    </div>
                 
                  </div> */}

                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['business_type'], {
                      defaultValue: profile?.business_type
                    })}
                  </div>
                  {profile?.business_type === 'Limited Company' ? (
                    <div className="grid grid-cols-1 gap-4 p-2">
                      {fieldRenderer.renderField(['company_name'], {
                        defaultValue: profile?.company_name
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 p-2">
                      <div className="rounded-lg bg-white">
                        <div className="relative bg-inherit">
                          <input
                            className={`${loanFormCommonStyleConstant.text.fieldClass} `}
                            placeholder=""
                            value={inputVale}
                            onChange={e => {
                              setInputVale(e.target.value);
                            }}
                            style={{ paddingLeft: '2.5rem' }}
                          />

                          <div className="pointer-events-none absolute left-2 top-5 h-4 w-4 -translate-y-1/2 transform text-gray-500">
                            <img
                              src={build}
                              className="h-4 w-4 rtl:rotate-[270deg]"
                            ></img>
                          </div>
                          <label
                            htmlFor="Company Name"
                            className={
                              loanFormCommonStyleConstant.text.labelClass
                            }
                          >
                            Company Name
                            <span className="text-red-500">{' *'}</span>
                          </label>

                          {lookupError ? (
                            <p className="text-[10px] text-red-500">
                              {lookupError}
                            </p>
                          ) : (
                            showDropDown &&
                            (loader ? (
                              <div
                                aria-hidden="true"
                                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
                              >
                                <Loader />
                              </div>
                            ) : (
                              <div
                                // ref={formRef}
                                className="left-0 top-full z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                              >
                                {addressList.map((item, index) => (
                                  <p
                                    key={index}
                                    className="block cursor-pointer px-4 py-2 transition duration-200 ease-in-out hover:bg-gray-200"
                                    onClick={() => handleSid(item)}
                                  >
                                    {item.Company_Name}
                                  </p>
                                ))}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['company_number'], {
                      defaultValue: profile?.company_number,
                      isDisabled:
                        getValues('business_type') === 'Limited Company'
                    })}
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['company_status'], {
                      defaultValue: profile?.company_status,
                      isDisabled:
                        getValues('business_type') === 'Limited Company'
                    })}
                  </div>
                  {/* <div className="grid gap-4 p-2 grid-cols-1">
                    {fieldRenderer.renderField(["customer"], {
                      defaultValue: profile?.customer,
                    })}
                  </div>  */}
                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['funding_purpose'], {
                      defaultValue: profile?.funding_purpose
                    })}
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['other_funding_purpose'], {
                      defaultValue: profile?.other_funding_purpose
                    })}
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-2">
                    {fieldRenderer.renderField(['trading_style'], {
                      defaultValue: profile?.trading_style
                    })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-2">
                <button
                  type="submit" // Ensure the button is of type submit
                  className="w-full rounded border border-blue-700 bg-blue-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-800"
                >
                  {'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default EditUnitProfile;
