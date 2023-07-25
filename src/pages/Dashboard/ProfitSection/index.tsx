import { lazy, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNetwork } from "wagmi";
import { toast } from "react-toastify";
import Section from "../../../components/Section";
import Table from "../../../components/tableComponents/Table";
import Th from "../../../components/tableComponents/Th";
import { ASSETS, MESSAGE_SWITCH_NETWORK } from "../../../utils/constants";
import { IAsset } from "../../../utils/interfaces";

//  ---------------------------------------------------------------------------------------------

const DPRow = lazy(() => import('./DPRow'))
const ClaimProfitDialog = lazy(() => import('./ClaimProfitDialog'))

//  ---------------------------------------------------------------------------------------------

interface IProps {
  ethPriceInUsd: number;
  usdcPriceInUsd: number;
}

//  ---------------------------------------------------------------------------------------------

const chainId = process.env.REACT_APP_CHAIN_ID

//  ---------------------------------------------------------------------------------------------

export default function ProfitSection({ ethPriceInUsd, usdcPriceInUsd }: IProps) {
  const isMobile = useMediaQuery({ maxWidth: 640 })
  const { chain } = useNetwork()

  const [dialogVisible, setDialogVisible] = useState<boolean>(false)
  const [assetToBeClaimed, setAssetToBeClaimed] = useState<IAsset>(ASSETS[0])

  const openDialog = (asset: IAsset) => {
    if (chain?.id === Number(chainId)) {
      setAssetToBeClaimed(asset)
      setDialogVisible(true)
    } else {
      toast.warn(MESSAGE_SWITCH_NETWORK)
    }
  }

  return (
    <Section title="Profit">
      {isMobile ? (
        <div className="flex flex-col gap-4">

        </div>
      ) : (
        <Table>
          <thead>
            <tr className="bg-gray-900">
              <Th label="Token" />
              <Th label="Profit" />
              <Th label="Profit in USD" />
              <Th label="Operation" />
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(asset => (
              <DPRow
                key={asset.id}
                asset={asset}
                ethPriceInUsd={ethPriceInUsd}
                usdcPriceInUsd={usdcPriceInUsd}
                openDialog={openDialog}
              />
            ))}
          </tbody>
        </Table>
      )}
      <ClaimProfitDialog
        visible={dialogVisible}
        setVisible={setDialogVisible}
        asset={assetToBeClaimed}
      />
    </Section>
  )
}