import styles from './AccountManagement.module.css'
import PolygonABI from '@/RegistryABIPolygon';
import { useState, useEffect } from 'react';
import {
    useAccount,
    useWaitForTransaction,
    usePrepareContractWrite,
    useContractWrite
} from 'wagmi';
import TxModal from '../TxModal/TxModal'
import { useDebounce } from '@/helper/useDebounce';

const DEFAULT_IMPLEMENTATION_ADDRESS = '0x2D25602551487C3f3354dD80D76D54383A243358';
const DOCS_URL = 'https://docs.tokenbound.org/contracts/deployments';

const AccountManagement = ({ NftDetails, tbaDetails }) => {

    const [currentImplementations, setCurrentImplementations] = useState([])
    const [implementationInput, setImplementationInput] = useState(DEFAULT_IMPLEMENTATION_ADDRESS)
    const debouncedImplementationInput = useDebounce(implementationInput)
    const [showInput, setShowInput] = useState(false);
    const [saltFixer, setSaltFixer] = useState()
    const [isModalOpen, setModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [shouldProceed, setShouldProceed] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(true);

    const account = useAccount({
        onConnect({ address, connector, isReconnected }) {
          console.log('Connected', { address, connector, isReconnected })
        },
      })

    const {config} = usePrepareContractWrite({
        address: '0x02101dfB77FDE026414827Fdc604ddAF224F0921',
        abi: PolygonABI,
        functionName: 'createAccount',
        chainId: 137,
        args: [
            debouncedImplementationInput,
            137,
            `${NftDetails.address}`,
            NftDetails.Id,
            saltFixer,
            '0x',
        ],
    });

    const {data, isLoading, isSuccess, error, reset, write} = useContractWrite(config);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    useEffect(() => {
        const implementationArray = tbaDetails?.Accounts?.Account?.map(acc => acc.implementation);
        if (implementationArray) {
            setCurrentImplementations(implementationArray);
        }
    }, [tbaDetails]);

    useEffect(() => {
        if (error) {
            setErrorMessage(error?.details);
        }
    }, [error]);

    const waitForTransaction = useWaitForTransaction({
        hash: data?.hash,
    });

    let buttonTimeout; 

    const handleImplementation = (e) => {
        setImplementationInput(e.target.value)

        if (buttonTimeout) clearTimeout(buttonTimeout);

        if (/^0x[a-fA-F0-9]{40}$/.test(e.target.value)) {
            buttonTimeout = setTimeout(() => {
                setIsButtonEnabled(true); 
            }, 1000);
        } else {
            setIsButtonEnabled(false); 
        }
    }

    const saltCalculator = () => {
        const count = currentImplementations.filter(impl => impl === implementationInput).length;
        console.log(`The count of the implementation ${implementationInput} is ${count}`);
        setSaltFixer(count);
    };
    
    useEffect(() => {
        if (shouldProceed && write) {
            write();
            console.log(write)
            openModal();
            setShouldProceed(false);
        }
    }, [shouldProceed, write])
    
    const handleCreateTBA = () => {
        setErrorMessage("");
        reset();

        if (!account.address) {
            setErrorMessage("Please Connect Your Wallet First.");
            openModal();
            return;
        }
    
        if (!/^0x[a-fA-F0-9]{40}$/.test(implementationInput)) {
            setErrorMessage("Invalid Ethereum address.");
            openModal();
            return;
        }
    
        saltCalculator();
    

        setShouldProceed(true);
    };

    return (
        <div className={styles.dropDownWrapper}>
            <div
                onClick={() => 
                    setShowInput(!showInput)
                }
                className={styles.createAccount}
            >
                <div className={`${styles.triangle} ${showInput ? styles.triangleDown : ''}`}></div>
                <span className={styles.createAccountText}>Create Token Bound Account</span>
            </div>
            <div className={`${styles['inputContainer']} ${showInput ? styles.open : styles.closed}`}>
                <div className={styles.addressText}>
                Address is obtained <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={styles.linkStyle}>from</a> Tokenbound team. Use a different one to customize it.
                </div>
                <input value={implementationInput} placeholder="Address" className={styles.inputBox} onChange={handleImplementation} />
                <button
                    onClick={handleCreateTBA}
                    className={styles.createTbaButton}
                    disabled={!isButtonEnabled}
                >
                    Create Account
                </button>
            </div>
            {isModalOpen && (
                <TxModal isLoading={isLoading} isSent={isSuccess} isSuccess={waitForTransaction.isSuccess} error={errorMessage} isOpen={isModalOpen} isFailed={waitForTransaction.isError} onClose={closeModal} />
            )}
        </div>
    );
}

export default AccountManagement