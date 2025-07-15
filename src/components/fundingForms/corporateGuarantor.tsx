import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useRef, useState } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  useFieldArray
} from 'react-hook-form';
import { useDispatch } from 'react-redux';
import user from '../../assets/svg/user.svg';
import {
  corporateGuarantorGetAPI,
  corporateGuarantorPostAPI,
  corporateGuarantorPropertyGetAPI,
  corporateGuarantorPropertyPostAPI
} from '../../api/loanServices';
import { updateCurrentStage } from '../../store/fundingStateReducer';
import {
  loanFormCommonStyleConstant,
  loanFormCorporateGuarantor
} from '../../utils/constants';
import { StayContext, updateFilledForms } from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import useAuth from '../../utils/hooks/useAuth';
import { CorporateGuarantorSchema } from '../../utils/Schema';
import {
  CorporateGuarantorType,
  FundingFormFieldType,
  LoanFromCommonProps
} from '../../utils/types';
import FieldRenderer from '../commonInputs/FieldRenderer';
import Loader from '../Loader';
import CorporateGuarantorPersonalDetails, {
  OwnedProperty
} from './corporateGuarantorPersonalDetails';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import city from '../../assets/svg/la_city.svg';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

const CorporateGuarantor: React.FC<LoanFromCommonProps> = ({
  setRef,
  loanId
}) => {
  const { authenticated } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  setRef(formRef);
  const { showToast } = useToast();
  const fieldRenderer = new FieldRenderer(
    loanFormCorporateGuarantor,
    loanFormCommonStyleConstant,
    CorporateGuarantorSchema
  );
  const dispatch = useDispatch();

  const methods = useForm({
    resolver: yupResolver(CorporateGuarantorSchema),
    defaultValues: { corporate_guarantors: [] }
  });

  const { handleSubmit, reset, control, getValues } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'corporate_guarantors'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [guarantorError, setGuarantorError] = useState(null);
  const [openGuarantorIndex, setOpenGuarantorIndex] = useState<number | null>(
    null
  );
  const [dateRanges, setDateRanges] = useState();

  const fetchDataFromApi = async (loanId: string) => {
    try {
      const [guarantorApiResponse, propertyApiResponse] = await Promise.all([
        corporateGuarantorGetAPI(loanId),
        corporateGuarantorPropertyGetAPI(loanId)
      ]);

      if (guarantorApiResponse?.status_code === 200) {
        const guarantorData = guarantorApiResponse.data;
        console.log('guarantorData', guarantorData);

        let guaranteed_property = {
          owns_other_property: 'No',
          owned_property_count: 0,
          owned_property: []
        };

        if (
          propertyApiResponse?.status_code === 200 &&
          Array.isArray(propertyApiResponse.data) &&
          propertyApiResponse.data.length > 0
        ) {
          const propArray = propertyApiResponse.data;

          guaranteed_property = {
            owns_other_property: propArray[0]?.owns_other_property || 'No',
            owned_property_count: propArray.length,
            owned_property: propArray.map(entry => ({
              owner_name: entry.owner_name || '',
              owner_email: entry.owner_email || '',
              address: entry.owned_property?.[0]?.address || '',
              pincode: entry.owned_property?.[0]?.pincode || ''
            }))
          };
        }

        reset({
          corporate_guarantors: guarantorData,
          guaranteed_property
        });
      } else {
        showToast(guarantorApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    if (authenticated && loanId) {
      fetchDataFromApi(loanId);
    }
  }, [loanId]);

  // const onSubmit: SubmitHandler<CorporateGuarantorType> = async data => {
  //   setIsLoading(true);

  //   console.log('CorporateGuarantordata', data);

  //   try {
  //     // data.corporate_guarantors.flatMap(dir =>
  //     //   dir.stay.map(stay => {
  //     //     stay.start_date = convertDateString(stay.start_date);
  //     //     stay.end_date = convertDateString(stay.end_date);
  //     //     return stay;
  //     //   })
  //     // );
  //     // const response = await guarantorPostAPI(
  //     //   data.corporate_guarantors[0],
  //     //   loanId
  //     // );
  //     // if (response.status_code >= 200 && response.status_code < 300) {
  //     //   showToast(response.status_message, { type: NotificationType.Success });
  //     //   updateFilledForms(loanId, { complete_guarantor: true });
  //     //   setTimeout(() => {
  //     //     dispatch(updateCurrentStage(8));
  //     //   }, 1500);
  //     // } else {
  //     //   showToast(response.status_message, { type: NotificationType.Error });
  //     // }
  //   } catch (error) {
  //     console.log('Exception', error);
  //     showToast('Something went wrong!', { type: NotificationType.Error });
  //   } finally {
  //     setTimeout(() => setIsLoading(false), 1500);
  //   }
  // };

  const onSubmit: SubmitHandler<CorporateGuarantorType> = async data => {
    setIsLoading(true);
    console.log('CorporateGuarantordata', data);

    try {
      const { corporate_guarantors, guaranteed_property } = data;

      // 1. Submit Corporate Guarantors
      const response = await corporateGuarantorPostAPI(
        { corporate_guarantors },
        loanId
      );

      if (response.status_code >= 200 && response.status_code < 300) {
        showToast(response.status_message, { type: NotificationType.Success });

        // 2. Transform owned_property into owners[] structure
        const owners =
          guaranteed_property.owned_property?.map(item => ({
            owner_name: item.owner_name,
            owner_email: item.owner_email,
            owned_property: [
              {
                pincode: item.pincode,
                address: item.address
              }
            ]
          })) || [];

        // 3. Call guaranteedPropertyPostAPI with correct structure
        const guaranteedRes = await corporateGuarantorPropertyPostAPI(
          {
            owns_other_property: guaranteed_property.owns_other_property,
            owned_property_count: guaranteed_property.owned_property_count,
            owners
          },
          loanId
        );

        if (
          guaranteedRes.status_code >= 200 &&
          guaranteedRes.status_code < 300
        ) {
          showToast(guaranteedRes.status_message, {
            type: NotificationType.Success
          });

          updateFilledForms(loanId, { complete_additional_details: true });

          setTimeout(() => {
            dispatch(updateCurrentStage(12));
          }, 1500);
        } else {
          showToast(guaranteedRes.status_message, {
            type: NotificationType.Error
          });
        }
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Exception', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const onError: SubmitErrorHandler<CorporateGuarantorType> = error => {
    console.log('getValues', getValues('corporate_guarantors'));

    showToast('Please check the validation error!', {
      type: NotificationType.Error
    });
    console.log('Validation Error:', error);
    setGuarantorError(error);
  };

  const directorConst: FundingFormFieldType[] = [
    {
      type: 'radioButton',
      name: `guaranteed_property.owns_other_property`,
      options: ['Yes', 'No'],
      optionLabelClass: `flex justify-between items-center text-[#929292] -ml-2`
    },
    {
      type: 'number',
      name: `guaranteed_property.owned_property_count`,
      placeholder: 'Number of property',
      min: 1,
      defaultValue: '1',
      icon: () => (
        <img src={city} className="mb-[2px] h-5 w-5 rtl:rotate-[270deg]" />
      )
    }
  ];

  fieldRenderer.updateConstant([
    ...fieldRenderer.getConstant(),
    ...directorConst
  ]);

  return (
    <StayContext.Provider
      value={{
        dateRanges,
        setDateRanges,
        methods
      }}
    >
      <FormProvider {...methods}>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Loader />
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit, onError)}
          className="mt-2 px-4"
        >
          {/* Add Guarantor Button */}
          <button
            type="button"
            className="mb-4 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() =>
              append({
                company_name: '',
                company_number: '',
                trading_name: '',
                registered_address: {
                  address_line: '',
                  post_code: ''
                },
                directors: []
              })
            }
          >
            <span>+ Add Guarantor</span>
          </button>

          {/* Render Guarantor Sections */}
          {fields.map((guarantor, index) => (
            <div key={guarantor.id} className={guarantorError && 'pb-8'}>
              <div
                className="accordion-title mb-4 flex cursor-pointer items-center justify-between rounded-lg border bg-white p-3"
                onClick={() =>
                  setOpenGuarantorIndex(prev => (prev === index ? null : index))
                }
              >
                <span
                  className={`accordion flex gap-2 text-[14px] ${
                    openGuarantorIndex === index
                      ? 'font-medium text-[#1A439A]'
                      : 'font-medium text-black'
                  }`}
                >
                  <img src={user} className="h-5 w-5" alt="User Icon" />
                  {`${guarantor.company_name || 'New'} `}
                </span>
                <span className="accordion-arrow mb-2">
                  {openGuarantorIndex === index ? (
                    <IoIosArrowUp />
                  ) : (
                    <IoIosArrowDown />
                  )}
                </span>
              </div>

              {openGuarantorIndex === index && (
                <div className="rounded border p-4">
                  <CorporateGuarantorPersonalDetails
                    currentDirectorIndex={index}
                    currentDirector={guarantor}
                    fieldRenderer={fieldRenderer}
                    partnerType="corporate_guarantors"
                    PartnerError={guarantorError}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Remove Guarantor
                  </button>
                </div>
              )}

              {/* Collapsed Error */}
              {openGuarantorIndex !== index &&
                guarantorError?.guarantors?.[index] && (
                  <div className="relative w-full border-red-500">
                    <p className="absolute mt-2 text-[10px] text-red-500">
                      Something went wrong, please check partner details you
                      filled.
                    </p>
                  </div>
                )}
            </div>
          ))}
          <div>
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
                  `guaranteed_property.owns_other_property`
                ])}
              </div>{' '}
            </div>

            <OwnedProperty fieldRenderer={fieldRenderer} />
          </div>
        </form>
      </FormProvider>
    </StayContext.Provider>
  );
};

export default CorporateGuarantor;
