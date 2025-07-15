import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { fetchAffordabilityApi } from '../../../api/loanServices';
import { authSelector } from '../../../store/auth/userSlice';
import { Roles } from '../../../utils/enums';
import { AffordabilityCurrentTab } from '../../../utils/helpers';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import ProgressCircle from '../../fundingForms/StepProgressCircle';
import AffordabilityApprovalForm from './AffordabilityApprovalForm';
import AffordabilityGeneralForm from './AffordabilityGeneralForm';
import AffordabilityGrossForm from './AffordabilityGrossForm';
import Loader from '../../Loader';

const CustomerAffordability = ({
  loanId,
  affordabilityActiveStage,
  setAffordabilityActiveStage,
  setRef,
  setStatueUpdate
}) => {
  const [data, setData] = useState(null);
  const { showToast } = useToast();
  const { role } = useSelector(authSelector);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const isHigherAuthority = [Roles.Admin, Roles.Manager].includes(role);

  const fetchAffordabilityData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAffordabilityApi(loanId);
      if (response.status_code >= 200 && response.status_code < 300) {
        setData(response?.data);
      } else {
        showToast(response.status_message, {
          type: NotificationType.Error
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
      setIsLoading(false);
    }
  };

  const renderAffordabilityContent = () => {
    switch (affordabilityActiveStage) {
      case 'general_form':
        return (
          <AffordabilityGeneralForm
            fetchData={fetchAffordabilityData}
            loanId={loanId}
            setAffordabilityActiveStage={setAffordabilityActiveStage}
            data={data}
            setRef={setRef}
            isUpdate={isUpdate}
            setIsUpdate={setIsUpdate}
          />
        );
      case 'gross_form':
        return (
          <AffordabilityGrossForm
            fetchData={fetchAffordabilityData}
            isHigherAuthority={isHigherAuthority}
            setAffordabilityActiveStage={setAffordabilityActiveStage}
            data={data}
            loanId={loanId}
            setRef={setRef}
            isUpdate={isUpdate}
            setIsUpdate={setIsUpdate}
          />
        );
      case 'approval_form':
      case 'affordability_completed':
        if ([Roles.UnderWriter].includes(role)) {
          return (
            <AffordabilityGrossForm
              fetchData={fetchAffordabilityData}
              isHigherAuthority={isHigherAuthority}
              setAffordabilityActiveStage={setAffordabilityActiveStage}
              data={data}
              loanId={loanId}
              setRef={setRef}
              isUpdate={isUpdate}
              setIsUpdate={setIsUpdate}
            />
          );
        }
        return (
          <AffordabilityApprovalForm
            fetchData={fetchAffordabilityData}
            data={data}
            loanId={loanId}
            setRef={setRef}
            isUpdate={isUpdate}
            setIsUpdate={setIsUpdate}
          />
        );
      default:
        return <h1>{'Empty!'}</h1>;
    }
  };

  const NumberOfForms = Roles.UnderWriter === role ? 2 : 3;
  useEffect(() => {
    if ([Roles.UnderWriter, Roles.Manager, Roles.Admin].includes(role)) {
      fetchAffordabilityData();
    }
  }, []);

  useEffect(() => {
    if (affordabilityActiveStage && setStatueUpdate) {
      setStatueUpdate(prevState => !prevState);
    }
  }, [affordabilityActiveStage]);

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="flex justify-end pr-2">
        <span className="flex h-16 justify-end bg-white pr-16 max-sm:mt-1 max-sm:h-12">
          <ProgressCircle
            currentStep={
              AffordabilityCurrentTab(affordabilityActiveStage) == 0
                ? NumberOfForms
                : AffordabilityCurrentTab(affordabilityActiveStage)
            }
            totalSteps={NumberOfForms}
          />
        </span>
        <button
          type="button"
          className="m-8 mt-2 flex cursor-pointer items-center bg-[#1A439A] px-4 py-3 text-white"
          onClick={() => {
            setIsUpdate(true);
          }}
        >
          <a className="max-sm:text-[10px]">{'Update'}</a>
        </button>
      </div>
      {/* <RenderAffordabilityScreen /> */}
      {renderAffordabilityContent()}
    </div>
  );
};

export default CustomerAffordability;
