import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import PaymentDetails from '../../../pages/profile/tabContents/PaymentDetails';
import { managementSliceSelector } from '../../../store/managementReducer';
import Contract from '../../fundingForms/Contract';
import { useLocation } from 'react-router-dom';

const FundingContract = () => {
  const { loan } = useSelector(managementSliceSelector);
  const [loanId, setLoanId] = useState<string | null>(null);
  const location = useLocation();
  const isContractTab = location.pathname.includes('contract');

  useEffect(() => {
    if (loan?.id) setLoanId(loan.id);
  }, [loan]);

  return (
    <div className="p-[4%]">
      {!isContractTab && <Contract loanId={loanId} />}
      <PaymentDetails loanId={loanId} />
    </div>
  );
};

export default FundingContract;
