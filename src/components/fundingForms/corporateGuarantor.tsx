import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm
} from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { FiPlus } from 'react-icons/fi';
import {
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineUser
} from 'react-icons/hi2';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import {
  addressLookupAPI,
  addressSidLookupAPI,
  corporateGuarantorGetAPI,
  corporateGuarantorPostAPI,
  corporateGuarantorPropertyGetAPI,
  corporateGuarantorPropertyPostAPI,
  listPropertyUsersAPI
} from '../../api/loanServices';
import { updateCurrentStage } from '../../store/fundingStateReducer';
import {
  loanFormCommonStyleConstant,
  loanFormCorporateGuarantor
} from '../../utils/constants';
import {
  lookUpAddressFormatter,
  StayContext,
  updateFilledForms
} from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import useAuth from '../../utils/hooks/useAuth';
import { CorporateGuarantorSchema } from '../../utils/Schema';
import {
  CorporateGuarantorType,
  LoanFromCommonProps,
  PropertyDetailsType
} from '../../utils/types';
import FieldRenderer from '../commonInputs/FieldRenderer';
import Loader from '../Loader';
import CorporateGuarantorPersonalDetails from './corporateGuarantorPersonalDetails';

const CorporateGuarantor: React.FC<LoanFromCommonProps> = ({
  setRef,
  loanId
}) => {
  const { authenticated } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (setRef) {
      setRef(formRef);
    }
  }, [setRef]);
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const fieldRenderer = new FieldRenderer(
    loanFormCorporateGuarantor,
    loanFormCommonStyleConstant,
    CorporateGuarantorSchema
  );

  const methods = useForm<CorporateGuarantorType>({
    resolver: yupResolver(CorporateGuarantorSchema) as any,
    defaultValues: {
      corporate_guarantors: [],
      guaranteed_property: {
        owns_other_property: 'No',
        owned_property_count: 0,
        title_no: '',
        properties: []
      }
    }
  });

  const {
    handleSubmit,
    reset,
    control,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors }
  } = methods;

  const {
    fields: guarantorFields,
    append: appendGuarantor,
    remove: removeGuarantor
  } = useFieldArray({
    control,
    name: 'corporate_guarantors'
  });

  const {
    fields: propertyFields,
    append: appendProperty,
    remove: removeProperty
  } = useFieldArray({
    control,
    name: 'guaranteed_property.properties' as any
  });

  const [isLoading, setIsLoading] = useState(false);
  const [guarantorError, setGuarantorError] = useState<any>(null);
  const [openGuarantorIndex, setOpenGuarantorIndex] = useState<number | null>(
    null
  );
  const [dateRanges, setDateRanges] = useState<any>();
  const [propertyUsers, setPropertyUsers] = useState<any[]>([]);

  // Watch owns_other_property to handle property clearing/adding
  const ownsOtherPropertyWatch = watch('guaranteed_property.owns_other_property');

  useEffect(() => {
    if (ownsOtherPropertyWatch === 'No') {
      // Clear properties when user selects No
      setValue('guaranteed_property.properties', []);
      setValue('guaranteed_property.owned_property_count', 0);
    } else if (ownsOtherPropertyWatch === 'Yes') {
      // Add default property if none exist
      const currentProperties = watch('guaranteed_property.properties');
      const currentTitleNo = watch('guaranteed_property.title_no') || '';
      if (!currentProperties || currentProperties.length === 0) {
        setValue('guaranteed_property.properties', [{
          pincode: '',
          address: '',
          title_no: currentTitleNo,
          owners: []
        }]);
        setValue('guaranteed_property.owned_property_count', 1);
      }
    }
  }, [ownsOtherPropertyWatch, setValue, watch]);

  const fetchDataFromApi = async (loanId: string) => {
    try {
      setIsLoading(true);
      const [guarantorApiResponse, propertyApiResponse, propertyUsersApiResponse] = await Promise.all([
        corporateGuarantorGetAPI(loanId),
        corporateGuarantorPropertyGetAPI(loanId),
        listPropertyUsersAPI(loanId)
      ]);

      let guarantorData = [];
      if (
        guarantorApiResponse?.status_code === 200 &&
        Array.isArray(guarantorApiResponse.data)
      ) {
        guarantorData = guarantorApiResponse.data;
      }

      // Fetch property users list
      if (propertyUsersApiResponse?.status_code === 200 && Array.isArray(propertyUsersApiResponse.data)) {
        setPropertyUsers(propertyUsersApiResponse.data);
      }

      let properties: PropertyDetailsType[] = [];
      let titleNo = '';
      let ownsOtherProperty: 'Yes' | 'No' = 'No';

      if (
        propertyApiResponse?.status_code === 200 &&
        propertyApiResponse.data
      ) {
        const responseData = propertyApiResponse.data;
        titleNo = responseData.title_no || '';
        ownsOtherProperty = (responseData.owns_other_property === 'Yes' || responseData.owns_other_property === 'No') ? responseData.owns_other_property : 'No';

        // Handle both response formats: flat owners OR nested property_data
        if (Array.isArray(responseData.owners) && responseData.owners.length > 0) {
          // Flat owners format (backend response)
          const propertyMap = new Map<string, PropertyDetailsType>();

          responseData.owners.forEach((owner: any) => {
            const propKey = `${owner.owned_property?.[0]?.pincode}_${owner.owned_property?.[0]?.address}`;

            if (!propertyMap.has(propKey)) {
              propertyMap.set(propKey, {
                id: owner.id,
                pincode: owner.owned_property?.[0]?.pincode || '',
                address: owner.owned_property?.[0]?.address || '',
                title_no: titleNo || '',
                owners: []
              });
            }

            const property = propertyMap.get(propKey)!;
            property.owners.push({
              id: owner.id,
              owner_name: owner.owner_name || '',
              owner_email: owner.owner_email || ''
            });
          });

          properties = Array.from(propertyMap.values());
        } else if (Array.isArray(responseData.property_data) && responseData.property_data.length > 0) {
          // Nested property_data format
          properties = responseData.property_data.map((prop: any, index: number) => ({
            id: prop.id,
            pincode: prop.pincode || '',
            address: prop.address || '',
            title_no: (index === 0 && titleNo) ? titleNo : (prop.title_no || ''),
            owners: Array.isArray(prop.owners)
              ? prop.owners.map((g: any) => ({
                  id: g.id,
                  owner_name: g.owner_name || '',
                  owner_email: g.owner_email || ''
                }))
              : []
          }));
        }
      }

      // Default to 1 property with 0 owners ONLY if owns_other_property is Yes and no data exists
      if (ownsOtherProperty === 'Yes' && properties.length === 0) {
        properties = [
          {
            pincode: '',
            address: '',
            title_no: titleNo || '',
            owners: []
          }
        ];
      }

      reset({
        corporate_guarantors: guarantorData,
        guaranteed_property: {
          owns_other_property: ownsOtherProperty,
          owned_property_count: ownsOtherProperty === 'Yes' ? properties.length : 0,
          title_no: titleNo,
          properties: ownsOtherProperty === 'Yes' ? properties : []
        }
      });
    } catch (error) {
      console.error('Exception fetching data:', error);
      showToast('Something went wrong fetching details!', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && loanId) {
      fetchDataFromApi(loanId);
    }
  }, [loanId, authenticated]);

  const onSubmit: SubmitHandler<CorporateGuarantorType> = async data => {
    setIsLoading(true);

    try {
      const { corporate_guarantors, guaranteed_property } = data;

      // 1. Submit Corporate Guarantors (independent call)
      const guarantorResponse = await corporateGuarantorPostAPI(
        { corporate_guarantors: corporate_guarantors || [] },
        loanId
      );

      if (
        guarantorResponse.status_code >= 200 &&
        guarantorResponse.status_code < 300
      ) {
        showToast(guarantorResponse.status_message, {
          type: NotificationType.Success
        });
      } else {
        showToast(guarantorResponse.status_message, {
          type: NotificationType.Error
        });
        setIsLoading(false);
        return; // Stop here if first API fails
      }

      // 2. Transform properties & owners into backend API structure (flat owners format)
      const properties = guaranteed_property?.properties || [];
      const ownsOtherProperty =
        guaranteed_property?.owns_other_property === 'Yes';
      // Extract title_no from the first property (since it's now per-property in UI)
      const titleNo = (properties.length > 0 && properties[0].title_no) || guaranteed_property?.title_no || '';

      const owners: any[] = [];
      if (ownsOtherProperty) {
        properties.forEach(prop => {
          (prop.owners || []).forEach(owner => {
            owners.push({
              id: owner.id,
              owner_name: owner.owner_name,
              owner_email: owner.owner_email,
              owned_property: [
                {
                  pincode: prop.pincode,
                  address: prop.address
                }
              ]
            });
          });
        });
      }

      // 3. Post to corporateGuarantorPropertyPostAPI (independent call)
      const propertyPayload = {
        owns_other_property: ownsOtherProperty ? 'Yes' : 'No',
        owned_property_count: owners.length,
        title_no: titleNo,
        owners: owners
      };

      const propertyResponse = await corporateGuarantorPropertyPostAPI(
        propertyPayload,
        loanId
      );

      if (
        propertyResponse.status_code >= 200 &&
        propertyResponse.status_code < 300
      ) {
        showToast(propertyResponse.status_message, {
          type: NotificationType.Success
        });

        updateFilledForms(loanId, { complete_additional_details: true });

        setTimeout(() => {
          dispatch(updateCurrentStage(11));
        }, 1500);
      } else {
        showToast(propertyResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.error('Exception submitting form:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const onError: SubmitErrorHandler<CorporateGuarantorType> = error => {
    showToast('Please check the validation errors!', {
      type: NotificationType.Error
    });
    console.error('Validation Error:', error);
    setGuarantorError(error);
  };

  const handleAddGuarantor = () => {
    if (guarantorFields.length >= 2) {
      showToast('Only 2 guarantors allowed', {
        type: NotificationType.warning
      });
      return;
    }
    appendGuarantor({
      company_name: '',
      company_number: '',
      trading_name: '',
      registered_address: {
        address_line: '',
        post_code: ''
      },
      directors: []
    } as any);
    setOpenGuarantorIndex(guarantorFields.length);
  };

  const handleAddProperty = () => {
    appendProperty({
      pincode: '',
      address: '',
      title_no: '',
      owners: []
    });
  };

  const handleRemoveProperty = (index: number) => {
    removeProperty(index);
  };

  const handlePropertyCountChange = (count: number) => {
    const currentProperties = watch('guaranteed_property.properties') || [];
    const currentCount = currentProperties.length;

    if (count > currentCount) {
      // Add new properties
      for (let i = currentCount; i < count; i++) {
        appendProperty({
          pincode: '',
          address: '',
          title_no: '',
          owners: []
        });
      }
    } else if (count < currentCount) {
      // Remove properties from the end
      for (let i = currentCount; i > count; i--) {
        removeProperty(i - 1);
      }
    }
  };

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
          className="mt-2 px-2 md:px-4"
        >
          {/* SECTION: Corporate Guarantors (Preserved functionality) */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <HiOutlineShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Corporate Guarantors
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add corporate guarantors for this application (optional, up
                    to 2)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddGuarantor}
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:self-auto"
              >
                <FiPlus className="h-4 w-4" />
                <span> Add Guarantor</span>
              </button>
            </div>

            {guarantorFields.length === 0 ? (
              <p className="text-xs italic text-gray-400">
                No corporate guarantors added. Click &quot;+ Add Guarantor&quot;
                above if required.
              </p>
            ) : (
              guarantorFields.map((guarantor: any, index) => (
                <div key={guarantor.id} className="mb-3">
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3.5 transition-colors hover:bg-gray-100"
                    onClick={() =>
                      setOpenGuarantorIndex(prev =>
                        prev === index ? null : index
                      )
                    }
                  >
                    <span
                      className={`flex items-center gap-2 text-sm ${
                        openGuarantorIndex === index
                          ? 'font-semibold text-blue-600'
                          : 'font-medium text-gray-800'
                      }`}
                    >
                      <HiOutlineShieldCheck className="h-4 w-4" />
                      {guarantor.company_name
                        ? `Guarantor: ${guarantor.company_name}`
                        : `Guarantor ${index + 1}`}
                    </span>
                    <span className="text-gray-500">
                      {openGuarantorIndex === index ? (
                        <IoIosArrowUp />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </span>
                  </div>

                  {openGuarantorIndex === index && (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
                      <CorporateGuarantorPersonalDetails
                        currentDirectorIndex={index}
                        currentDirector={guarantor}
                        fieldRenderer={fieldRenderer}
                        partnerType="corporate_guarantors"
                        PartnerError={guarantorError}
                      />
                      <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={() => removeGuarantor(index)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                          <span>Remove Guarantor</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {openGuarantorIndex !== index &&
                    guarantorError?.guarantors?.[index] && (
                      <p className="mt-1 text-xs text-red-500">
                        Please review details for Guarantor {index + 1}.
                      </p>
                    )}
                </div>
              ))
            )}
          </div>

          {/* SECTION: Own Any Other Property */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Do you own any other property?
              </h3>
              <p className="text-xs text-gray-500">
                Select Yes if you have additional properties to declare
              </p>
            </div>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  {...register('guaranteed_property.owns_other_property')}
                  value="Yes"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  {...register('guaranteed_property.owns_other_property')}
                  value="No"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            {errors?.guaranteed_property?.owns_other_property && (
              <p className="mt-2 text-xs text-red-500">
                {errors.guaranteed_property.owns_other_property.message}
              </p>
            )}
          </div>

          {/* SECTION: Property Count */}
          {watch('guaranteed_property.owns_other_property') === 'Yes' && (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Property Information
                </h3>
                <p className="text-xs text-gray-500">
                  Enter the number of properties you own
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <div className="md:w-1/2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Number of Properties
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="e.g. 2"
                    {...register('guaranteed_property.owned_property_count', {
                      valueAsNumber: true,
                      onChange: (e) => handlePropertyCountChange(parseInt(e.target.value) || 0)
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors?.guaranteed_property?.owned_property_count && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.guaranteed_property.owned_property_count.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Properties & Owners (Matching Reference Design) */}
          {watch('guaranteed_property.owns_other_property') === 'Yes' && (
            <div className="mb-8">
              {/* Header */}
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                    Properties &amp; Owners
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add one or more properties and the corresponding owners for
                    each property.
                  </p>
                </div>
              </div>

              {/* Properties List */}
              {propertyFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No properties added yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProperty}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Property</span>
                  </button>
                </div>
              ) : (
                propertyFields.map((propertyItem, propertyIndex) => {
                  const propErrors =
                    errors?.guaranteed_property?.properties?.[propertyIndex];

                  return (
                    <div
                      key={propertyItem.id}
                      className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 overflow-visible"
                    >
                      {/* Property Card Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <HiOutlineHome className="h-5 w-5" />
                          </div>
                          <span className="text-base font-semibold text-gray-900">
                            Property {propertyIndex + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProperty(propertyIndex)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-1.5 text-sm font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                          <span>Remove Property</span>
                        </button>
                      </div>

                      {/* Property Inputs: Title No */}
                      <div className="my-5 md:w-1/2">
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                          Title No
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 18Ahdj908"
                          {...register(
                            `guaranteed_property.properties.${propertyIndex}.title_no` as any
                          )}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Property Inputs: Postcode & Address */}
                      <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-12 relative z-50">
                        <div className="md:col-span-4 relative z-50">
                          <PropertyPostcodeInput
                            propertyIndex={propertyIndex}
                            register={register}
                            setValue={setValue}
                            trigger={trigger}
                            watch={watch}
                            error={propErrors?.pincode?.message}
                          />
                        </div>
                        <div className="md:col-span-8">
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 10 Downing Street, Westminster, London, SW1A 1AA"
                            {...register(
                              `guaranteed_property.properties.${propertyIndex}.address` as any
                            )}
                            className={`w-full rounded-lg border ${
                              propErrors?.address
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          {propErrors?.address && (
                            <p className="mt-1 text-xs text-red-500">
                              {propErrors.address.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sub-Section: Owners */}
                      <PropertyOwnersList
                        control={control}
                        propertyIndex={propertyIndex}
                        register={register}
                        errors={errors}
                        propertyUsers={propertyUsers}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </form>
      </FormProvider>
    </StayContext.Provider>
  );
};

export default CorporateGuarantor;

/**
 * Nested Owners List per Property
 */
const PropertyOwnersList: React.FC<{
  control: any;
  propertyIndex: number;
  register: any;
  errors: any;
  propertyUsers: any[];
}> = ({ control, propertyIndex, register, errors, propertyUsers }) => {
  const {
    fields: ownerFields,
    append: appendOwner,
    remove: removeOwner
  } = useFieldArray({
    control,
    name: `guaranteed_property.properties.${propertyIndex}.owners` as any
  });

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAddOwner = () => {
    appendOwner({
      owner_name: '',
      owner_email: ''
    });
  };

  const handleAddOwnerFromList = (user: any) => {
    appendOwner({
      owner_name: `${user.first_name} ${user.last_name}`,
      owner_email: user.email
    });
    setShowUserDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Owners</h3>
        <div className="flex gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 md:text-sm"
            >
              <FiPlus className="h-3.5 w-3.5" />
              <span>Add Owner</span>
            </button>
            {showUserDropdown && propertyUsers.length > 0 && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="max-h-64 overflow-auto p-2">
                  <p className="mb-2 px-2 text-xs font-medium text-gray-500">Select from Loan Users:</p>
                  {propertyUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleAddOwnerFromList(user)}
                      className="w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={handleAddOwner}
                    className="w-full rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    + Add Manual Owner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {ownerFields.length === 0 ? (
        <div>
          <p className="py-2 text-xs italic text-gray-400">
            No owners added for this property. Click &quot;+ Add Owner&quot;
            above.
          </p>
          {(errors?.guaranteed_property?.properties?.[propertyIndex]?.owners as any)?.message && (
            <p className="mt-1 text-xs text-red-500">
              {(errors?.guaranteed_property?.properties?.[propertyIndex]?.owners as any)?.message}
            </p>
          )}
        </div>
      ) : (
        ownerFields.map((ownerItem, ownerIndex) => {
          const ownerErrors =
            errors?.guaranteed_property?.properties?.[propertyIndex]?.owners?.[
              ownerIndex
            ];

          return (
            <div
              key={ownerItem.id}
              className="shadow-2xs mt-3 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center"
            >
              {/* Owner Badge & Title */}
              <div className="flex min-w-[100px] shrink-0 items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <HiOutlineUser className="h-4 w-4" />
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-blue-600">
                  Owner {ownerIndex + 1}
                </span>
              </div>

              {/* Owner Input Fields */}
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    {...register(
                      `guaranteed_property.properties.${propertyIndex}.owners.${ownerIndex}.owner_name` as any
                    )}
                    readOnly
                    className={`w-full rounded-lg border ${
                      ownerErrors?.owner_name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 cursor-not-allowed`}
                  />
                  {ownerErrors?.owner_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {ownerErrors.owner_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Owner Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. john.smith@email.com"
                    {...register(
                      `guaranteed_property.properties.${propertyIndex}.owners.${ownerIndex}.owner_email` as any
                    )}
                    readOnly
                    className={`w-full rounded-lg border ${
                      ownerErrors?.owner_email
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 cursor-not-allowed`}
                  />
                  {ownerErrors?.owner_email && (
                    <p className="mt-1 text-xs text-red-500">
                      {ownerErrors.owner_email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Remove Owner Button */}
              <button
                type="button"
                onClick={() => removeOwner(ownerIndex)}
                className="inline-flex shrink-0 items-center gap-1.5 self-end py-1 text-sm font-medium text-red-500 transition-colors hover:text-red-700 md:self-center md:py-0"
              >
                <HiOutlineTrash className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

/**
 * Postcode input with address lookup autocompletion
 */
const PropertyPostcodeInput: React.FC<{
  propertyIndex: number;
  register: any;
  setValue: any;
  trigger: any;
  watch: any;
  error?: string;
}> = ({ propertyIndex, register, setValue, trigger, error }) => {
  const [addressList, setAddressList] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const performLookup = useCallback(async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 3) {
      setAddressList([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await addressLookupAPI({ address: cleanQuery });
      if (
        result?.status_code === 200 &&
        result.data?.Results?.Items?.length > 0
      ) {
        setAddressList(result.data.Results.Items);
        setShowDropdown(true);
      } else {
        setAddressList([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('Postcode lookup error:', err);
      setAddressList([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      performLookup(val);
    }, 400);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelectAddress = async (item: any) => {
    try {
      setIsSearching(true);
      if (item.Sid) {
        const result = await addressSidLookupAPI({ address_sid: item.Sid });
        if (result?.status_code === 200 && result.data?.Results?.Items?.length > 0) {
          if (result.data.Results.NumItems > 1) {
            setAddressList(result.data.Results.Items);
            setShowDropdown(true);
            setIsSearching(false);
            return;
          }
          const rawAddress = result.data.Results.Items[0];
          const formatted = lookUpAddressFormatter(rawAddress);

          if (formatted.pincode) {
            setValue(
              `guaranteed_property.properties.${propertyIndex}.pincode`,
              formatted.pincode.toUpperCase()
            );
          }
          if (formatted.addressText) {
            setValue(
              `guaranteed_property.properties.${propertyIndex}.address`,
              formatted.addressText
            );
          }
          trigger([
            `guaranteed_property.properties.${propertyIndex}.pincode`,
            `guaranteed_property.properties.${propertyIndex}.address`
          ]);
          setShowDropdown(false);
        } else {
          setShowDropdown(false);
        }
      } else if (item.Postcode || item.Text || item.ItemText || item.Description) {
        if (item.Postcode) {
          setValue(
            `guaranteed_property.properties.${propertyIndex}.pincode`,
            item.Postcode.toUpperCase()
          );
        }
        if (item.ItemText || item.Description || item.Text) {
          setValue(
            `guaranteed_property.properties.${propertyIndex}.address`,
            item.ItemText || item.Description || item.Text
          );
        }
        trigger([
          `guaranteed_property.properties.${propertyIndex}.pincode`,
          `guaranteed_property.properties.${propertyIndex}.address`
        ]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('SID lookup error:', err);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1.5 block text-xs font-medium text-gray-700">
        Postcode <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="e.g. SW1A 1AA"
          {...register(
            `guaranteed_property.properties.${propertyIndex}.pincode` as any,
            {
              onChange: handleInputChange
            }
          )}
          className={`w-full rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-300'
          } px-3.5 py-2.5 text-sm uppercase text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {showDropdown && addressList.length > 0 && (
        <ul className="absolute z-[99999] mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-xs shadow-lg">
          {addressList.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectAddress(item)}
              className="cursor-pointer border-b border-gray-100 px-3 py-2 text-gray-800 transition-colors last:border-b-0 hover:bg-blue-50"
            >
              {item.ItemText ||
                item.Text ||
                item.Description ||
                item.Street ||
                item.AddressLine1 ||
                item.Postcode}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
