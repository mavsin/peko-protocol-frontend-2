import { useMemo } from "react";
import { useAccount, useBalance, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useMediaQuery } from "react-responsive";
import { formatUnits } from "viem";
import { toast } from "react-toastify";
import Table from "../../../components/tableComponents/Table";
import Th from "../../../components/tableComponents/Th";
import Section from "../../../components/Section";
import Td from "../../../components/tableComponents/Td";
import { IUserInfo } from "../../../utils/interfaces";
import { MESSAGE_SWITCH_NETWORK, PEKO_CONTRACT_ADDRESS, PEKO_DECIMAL, POOL_CONTRACT_ABI, POOL_CONTRACT_ADDRESS } from "../../../utils/constants";
import FilledButton from "../../../components/buttons/FilledButton";
// import ClaimPekoDialog from "./ClaimPekoDialog";

//  ------------------------------------------------------------------------------------------------------

interface IProps {
  userInfo: IUserInfo;
}

//  ------------------------------------------------------------------------------------------------------

const chainId = process.env.REACT_APP_CHAIN_ID

//  ------------------------------------------------------------------------------------------------------

export default function PekoSection({ userInfo }: IProps) {
  const isMobile = useMediaQuery({ maxWidth: 640 })
  const { address } = useAccount()
  const { chain } = useNetwork()

  // const [dialogVisible, setDialogVisible] = useState<boolean>(false)

  //  --------------------------------------------------------------------

  const { data: pekoBalanceDataOfWallet } = useBalance({
    address,
    token: PEKO_CONTRACT_ADDRESS,
    watch: true
  })

  //  Claim Peko
  const { config: configOfClaimPeko } = usePrepareContractWrite({
    address: POOL_CONTRACT_ADDRESS,
    abi: POOL_CONTRACT_ABI,
    functionName: 'claimPeko',
  })
  const { write: claimPeko, data: claimPekoData } = useContractWrite(configOfClaimPeko);
  const { isLoading: claimPekoIsLoading } = useWaitForTransaction({
    hash: claimPekoData?.hash,
    onSuccess: () => {
      toast.success('Peko Claimed.')
    },
    onError: () => {
      toast.error('Claim occured error.')
    }
  })

  //  --------------------------------------------------------------------

  const isValidClaim = useMemo<boolean>(() => {
    if (pekoBalanceDataOfWallet) {
      if (Number(pekoBalanceDataOfWallet.formatted) > 0) {
        return true
      }
    }
    return false
  }, [pekoBalanceDataOfWallet])

  //  --------------------------------------------------------------------

  const handleClaimPeko = () => {
    if (chain?.id === Number(chainId)) {
      claimPeko?.()
    } else {
      toast.warn(MESSAGE_SWITCH_NETWORK)
    }
  }

  return (
    <Section title="Peko">
      {isMobile ? (
        <div className="flex flex-col text-sm gap-4">
          <div className="flex flex-col gap-4 text-gray-100 border-b border-gray-800 pb-6">
            {/* Symbol */}
            <div className="flex justify-between w-full">
              <span className="text-gray-500 font-bold">Symbol: </span>
              <div className="flex items-center gap-2">
                <img src="/assets/images/logo.png" alt="" className="w-8" />
                <span className="font-semibold uppercase">PEKO</span>
              </div>
            </div>

            {/* Unclaimed Peko */}
            <div className="flex justify-between w-full">
              <span className="text-gray-500 font-bold">Unclaimed Peko: </span>
              <span>{formatUnits(userInfo.pekoRewardAmount, PEKO_DECIMAL)} PEKO</span>
            </div>

            {/* Wallet Balance */}
            <div className="flex justify-between w-full">
              <span className="text-gray-500 font-bold">Wallet Balance: </span>
              <span>{pekoBalanceDataOfWallet?.formatted} PEKO</span>
            </div>

            {/* Operation */}
            <div className="flex justify-between w-full">
              <span className="text-gray-500 font-bold">Oepration: </span>
              <FilledButton
                disabled={!claimPeko || claimPekoIsLoading || !isValidClaim}
                onClick={() => handleClaimPeko()}
              >
                Claim
              </FilledButton>
            </div>
          </div>
        </div>
      ) : (
        <Table>
          <thead>
            <tr className="bg-gray-900">
              <Th label="Symbol" />
              <Th label="Unclaimed PEKO" />
              <Th label="Wallet Balance" />
              <Th label="Operation" />
            </tr>
          </thead>

          <tbody>
            <tr>
              <Td>
                <div className="flex items-center gap-2">
                  <img src="/assets/images/logo.png" alt="" className="w-8" />
                  <span className="font-semibold uppercase">PEKO</span>
                </div>
              </Td>
              <Td className="text-gray-100">
                {formatUnits(userInfo.pekoRewardAmount, PEKO_DECIMAL)} PEKO
              </Td>
              <Td className="text-gray-100">
                {pekoBalanceDataOfWallet?.formatted} PEKO
              </Td>
              <Td>
                <FilledButton
                  disabled={!claimPeko || claimPekoIsLoading || !isValidClaim}
                  onClick={() => claimPeko?.()}
                >
                  Claim
                </FilledButton>
              </Td>
            </tr>
          </tbody>
        </Table>
      )}
      {/* <ClaimPekoDialog userInfo={userInfo} visible={dialogVisible} setVisible={setDialogVisible} /> */}
    </Section>
  )
}