"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmi } from "@/src/hooks/useUmit";
import { useState } from "react";
import {
  createMerkleTree,
  createCollectionNFT,
  mintMultipleCNFTs,
} from "@/src/libs/cnftutils";
import VerificationLinks from "./VerificationLinks";
import { Signer } from "@metaplex-foundation/umi";
import { FELLOW_ADDRESSES } from "@/src/constant/publicAddresses";
import { Button } from "../Profile";

interface MintInfo {
  merkleTree: Signer;
  collectionNft: Signer;
  assetIds: string[];
}

export default function MintCNFTButton() {
  const { publicKey: walletPublicKey } = useWallet();
  const umi = useUmi();
  const [isMinting, setIsMinting] = useState(false);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 
  const recipients = FELLOW_ADDRESSES;

  const handleMint = async () => {
    if (!umi || !walletPublicKey || recipients.length === 0) return;

    setIsMinting(true);
    setMintStatus("Preparing to mint...");
    setErrorMessage(null); 

    try {
      const merkleTree = await createMerkleTree(umi);
      setMintStatus("Merkle tree created. Creating collection NFT...");

      const collectionNft = await createCollectionNFT(umi);
      setMintStatus("Collection NFT created. Minting cNFTs... This may take a while.");

      const assetIds = await mintMultipleCNFTs(umi, merkleTree, collectionNft, recipients);

      setMintInfo({ merkleTree, collectionNft, assetIds });
      setMintStatus(`${assetIds.length} cNFTs minted successfully!`);
    } catch (error: any) {
      console.error("Error minting cNFTs:", error);
      

      setErrorMessage(
        error?.message || "An unknown error occurred during minting. Please try again."
      );
      setMintStatus("Minting failed.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Button onClick={handleMint} >
          {isMinting ? "Minting..." : `Mint to ${recipients.length} ${recipients.length === 1 ? 'Fellow' : 'Fellows'}`}
        </Button>
      </div>
      {mintStatus && (
        <div className="bg-gray-100 p-4 rounded text-black">
          <p className="font-semibold">Status:</p>
          <p>{mintStatus}</p>
        </div>
      )}
      {errorMessage && ( 
        <div className="bg-red-100 p-4 rounded text-red-600">
          <p className="font-semibold">Error:</p>
          <p>{errorMessage}</p>
        </div>
      )}
      {mintInfo && <VerificationLinks mintInfo={mintInfo} />}
    </div>
  );
}
