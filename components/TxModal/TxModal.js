import styles from './TxModal.module.css'
import Image from 'next/image';


const TxModal = ({ isOpen, onClose, error, isLoading, isSent, isSuccess, isFailed }) => {
    if (!isOpen) return null;
    
    console.log(error);
    console.log(isLoading);
    console.log("isSent: ",isSent);
    console.log("isSuccess: ",isSuccess);

    return (
        <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`}>
            <div>
                <div onClick={onClose} className={styles.modalClose}>Close</div>
                <div className={styles.txInfo}>
                {error ? (
                    error.includes("User rejected the request") ? (
                        "Request has rejected"
                    ) : (
                        error
                    )
                ) : isSuccess ? (
                    <div className={styles.modalInfo}>
                        Your account is created!
                        <Image
                            src="/success.gif"
                            width={100}
                            height={100}
                            alt="Success GIF"
                        />
                    </div>
                ) : isSent ? (
                    <div className={styles.modalInfo}>
                        Transaction has sent
                        <Image
                            src="/giphy.gif"
                            width={100}
                            height={100}
                            alt="Loading GIF"
                        />
                    </div>
                ) : isLoading ? ( 
                    <div className={styles.modalInfo}>
                        Your account will be created after you signed the transaction
                        <Image
                            src="/giphy.gif"
                            width={100}
                            height={100}
                            alt="Loading GIF"
                        />
                    </div>
                ) : isFailed ? (
                    <div className={styles.modalInfo}>
                        Transaction failed
                        <Image
                            src="/fail.gif"
                            width={100}
                            height={100}
                            alt="Fail GIF"
                        />
                    </div>
                ) : (
                    <div> 
                      An unknown situation has appeared. Please try again in few seconds.
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default TxModal;
