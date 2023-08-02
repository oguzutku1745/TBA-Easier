import styles from './AccountManagement.module.css'
import PolygonABI from '@/RegistryABIPolygon';
import { useState, useEffect } from 'react';
import {
    useAccount,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    useContractRead
} from 'wagmi';

const AccountManagement = ({ NftDetails, tbaDetails }) => {
    

    const [currentImplementations, setCurrentImplementations] = useState([])
    const [implementationInput, setImplementationInput] = useState("")
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
      const implementationArray = tbaDetails?.Accounts?.Account?.map(acc => acc.implementation);
      if (implementationArray) { // Only update the state if implementationArray is defined
        setCurrentImplementations(implementationArray);
      }
    }, [tbaDetails]);

    console.log(currentImplementations)

    const { config } = usePrepareContractWrite({
        address: '0x02101dfB77FDE026414827Fdc604ddAF224F0921',
        abi: PolygonABI,
        functionName: 'createAccount',
        chainId: 137,
        args: [
            `${implementationInput}`,
            137,
            `${NftDetails.address}`,
            NftDetails.Id,
            0,
            '0x',
        ],
    });

    const contractWrite = useContractWrite(config);

    const waitForTransaction = useWaitForTransaction({
        hash: contractWrite.data?.hash,
    });

    const handleImplementation = (e) => {
      setImplementationInput(e.target.value)
    }

    return (
      <div>
          <button
              onClick={() => setShowInput(!showInput)}
              className={styles.createAccount}
          >
              Create Account
          </button>
          <div className={`${styles['inputContainer']} ${showInput ? styles.open : styles.closed}`}>
              <input value={implementationInput} placeholder="Implementation address" className={styles.inputField} onChange={handleImplementation} />
              <button
                  onClick={() => contractWrite.write?.()}
                  className={styles.createTbaButton}
              >
                  Create TBA Account
              </button>
          </div>
          {contractWrite.isLoading && <div>Sign the Transaction</div>}
          {contractWrite.isSuccess && <div>Transaction sent</div>}
          {waitForTransaction.isSuccess && <div>Minted Successfully</div>}
      </div>
  );
}

export default AccountManagement
