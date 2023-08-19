import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'
import Head from 'next/head';
import styles from './Home.module.css';
import { init, useLazyQuery } from "@airstack/airstack-react";
import dynamic from 'next/dynamic';
import AccountComponent from '@/components/AccountComponent/AccountComponent';
import Menubar from '@/components/Navbar/Menubar';
import Image from 'next/image';
init(process.env.NEXT_PUBLIC_AIRSTACK_INIT);

const NFTComponent = dynamic(() => import('@/components/NFTComponent/NFTComponent'), { ssr: false })

const Home = () => {

  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected })
    },
  })

  const [inputAddress, setInputAddress] = useState("");
  const [inputTokenId, setInputTokenId] = useState("");
  const [tokenDetails, setTokenDetails] = useState({});
  const [NFTS, setNFTS] = useState([])
  const [isNexted, setIsNexted] = useState(false)
  const [tokenImage, setTokenImage] = useState("")
  const [tbaNftDetails, setTbaNftDetails] = useState([])
  
  const nexted = () => {
    setIsNexted(true)
  }

  const resetPage = () => {
    setTokenDetails({});
    setTbaNftDetails([])
    setIsNexted(false);
  };
  
  const NFTFetch = `query tokens($address: Identity!) {
    erc721: TokenBalances(
      input: {blockchain: polygon, filter: {owner: {_in: [$address]}, tokenType: {_in: [ERC721]}}}
      ) {
        data:TokenBalance {
          amount
          chainId
          id
          tokenAddress
          tokenId
      tokenType
      token {
        name
        symbol
      }
      tokenNfts {
        tokenId
        metaData {
          name
        }
        contentValue {
          image {
            medium
            extraSmall
            large
            original
            small
          }
        }
      }
    }
  }
}`


  const tbaNfts = `query MyQuery($tokenAddress: Address, $tokenId: String) {
    TokenBalances(
      input: {blockchain: polygon, filter: {tokenAddress: {_eq: $tokenAddress}, tokenId: {_eq: $tokenId}}}
    ) {
      TokenBalance {
        tokenAddress
        tokenId
        owner {
          addresses
        }
        tokenNfts {
          erc6551Accounts {
            implementation
            address {
              addresses
              tokenBalances {
                tokenAddress
                tokenId
                tokenNfts {
                  contentValue {
                    image {
                      extraSmall
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
  

  const [fetch, { data, loading, error }] = useLazyQuery(NFTFetch);

  const [fetchTbaNfts, responseTbaNfts] = useLazyQuery(tbaNfts);
  
  useEffect(() => {
    if (tokenDetails && isNexted) {
    fetchTbaNfts({
      "tokenAddress": `${tokenDetails.address}`,
      "tokenId": `${tokenDetails.Id}` 
    })
    }
  }, [tokenDetails, isNexted])


  useEffect(() => {
    if (responseTbaNfts.data != null) {
      setTbaNftDetails(responseTbaNfts.data?.TokenBalances?.TokenBalance[0]?.tokenNfts?.erc6551Accounts)
    }
  }, [responseTbaNfts]);

  useEffect(() => {
    if (account.address) {
      fetch(   {   
        "address": `${account.address}`,
    })
    }
  },[account.address])

  useEffect(() => {
    if (data && data.erc721 && data.erc721.data) {
      console.log(data)
      setNFTS(data.erc721.data)
    }
  }, [data])

  const handleAddressChange = (e) => {
    setInputAddress(e.target.value);
  };
  
  const handleTokenIdChange = (e) => {
    setInputTokenId(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTokenDetails({ address: inputAddress, Id: inputTokenId });
    nexted();
  };


  return (
    <Menubar resetPage={resetPage}>
    <div className={styles.container}>
      <Head>
        <title>TBA Easier</title>
        <meta
          content="Manage Token Bound Accounts Easier"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

        <div className={styles.inputSec}>
          <div className={styles.infoWriting}>You can connect your wallet to find your NFTs, or you can directly search for spesific NFT.</div>
          <div className={styles.inputAligner}>
          <form className={styles.gapper} onSubmit={handleFormSubmit}>
            <div className={styles.formGapDetailer}>
              <span className={styles.inputFrontiers}>NFT Address</span> <input value={inputAddress} onChange={handleAddressChange} placeholder='Contract address' className={styles.inputBox} />
            </div>
            <div className={styles.formGapDetailer}>
              <span className={styles.inputFrontiers}>Token Id</span> <input value={inputTokenId} onChange={handleTokenIdChange} placeholder='Token Id' className={styles.inputBox} />
            </div>

              <button className={styles.buttonx}>Find TB Accounts</button>

          </form>
          {(tokenDetails && isNexted) && (
          <div className={styles.imageAndLinkWrapper}>
            <Image
              className={styles.NFTImage}
              src={tokenImage}
              width={200}
              height={200}
              alt="NFT Display Picture"
            />
            <div className={styles.arrowLinkContainer}>
              <Link
                className={styles.linkArrow}
                href={{
                  pathname: '/manage',
                  query: tokenDetails
                }}
              >
                <span className={styles.manageWriting}>Manage this NFT </span>
                <div className={styles.arrow}>
                  <div className={styles.arrowTop}></div>
                  <div className={styles.arrowBottom}></div>
                </div>
              </Link>
            </div>
          </div>
        )}

          </div>
          
        </div>

        {
    (tokenDetails && isNexted) ? (
        <>
            <div className={styles.nftWriting}>- Your Accounts -</div>
            {responseTbaNfts.loading ? (
                <div className={styles.aligner}>
                    Loading...
                </div>
            ) : tbaNftDetails?.length > 0 ? (
                <div className={styles.aligner}>
                    <table className={styles.table}>
                        <thead>
                            <tr className={styles.header}>
                                <td className={styles.cell}>Account Address</td>
                                <td className={styles.cell}>Implementation Address</td>
                            </tr>
                        </thead>
                        <tbody>
                            {tbaNftDetails.map((acc, index) => (
                                <AccountComponent index={index} key={index} acc={acc} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.aligner}>
                    There is no Token Bound Account for this NFT
                </div>
            )}
        </>
    ) : (NFTS.length > 0 ? (
        <>
            <div className={styles.nftWriting}>- Your NFTs -</div>
            <div className={styles.nftGallery}>
                {NFTS.map((nft, index) => (
                    <div key={index}>
                        <NFTComponent     
                            setInputAddress={setInputAddress}
                            setInputTokenId={setInputTokenId} 
                            setTokenImage={setTokenImage} 
                            nfts={nft} 
                            setTokenDetails={setTokenDetails}
                            next={nexted} />
                    </div>
                ))}
            </div>
        </>
    ) : null)
}

        
        

      <footer className={styles.footer}>
        <a href="https://github.com/oguzutku1745/TBA-Easier" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by KyaTzu
        </a>
      </footer>
    </div>
    </Menubar>
  );
};

export default Home;
