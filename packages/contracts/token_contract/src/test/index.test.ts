import { TokenContractArtifact, TokenContract } from "../artifacts/Token.js"
import { AccountWallet, CompleteAddress, ContractDeployer, createDebugLogger, Fr, PXE, waitForPXE, TxStatus, createPXEClient, getContractInstanceFromDeployParams, DebugLogger } from "@aztec/aztec.js";
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing"

const setupSandbox = async () => {
    const { PXE_URL = 'http://localhost:8080' } = process.env;
    const pxe = createPXEClient(PXE_URL);
    await waitForPXE(pxe);
    return pxe;
};

describe("Voting", () => {
    let pxe: PXE;
    let wallets: AccountWallet[] = [];
    let accounts: CompleteAddress[] = [];
    let logger: DebugLogger;

    beforeAll(async () => {
        logger = createDebugLogger('aztec:aztec-starter');
        logger.info("Aztec-Starter tests running.")

        pxe = await setupSandbox();

        wallets = await getInitialTestAccountsWallets(pxe);
        accounts = wallets.map(w => w.getCompleteAddress())
    })

    it("Deploys the contract", async () => {
        const salt = Fr.random();
        const [deployerWallet, adminWallet] = wallets; // using first account as deployer and second as contract admin
        const adminAddress = adminWallet.getCompleteAddress().address;

        const deploymentOptions = {
            constructorArgs: [adminAddress, "TestToken", "TT", 18],
            salt,
            deployer: deployerWallet.getAddress()
        };

        const deploymentData = getContractInstanceFromDeployParams(TokenContractArtifact, deploymentOptions);
        const deployer = new ContractDeployer(TokenContractArtifact, deployerWallet);
        const tx = deployer.deploy(...deploymentOptions.constructorArgs).send({ contractAddressSalt: salt })
        const receipt = await tx.getReceipt();

        expect(receipt).toEqual(
            expect.objectContaining({
                status: TxStatus.PENDING,
                error: ''
            }),
        );

        const receiptAfterMined = await tx.wait({ wallet: deployerWallet });

        expect(await pxe.getContractInstance(deploymentData.address)).toBeDefined();
        expect(await pxe.isContractPubliclyDeployed(deploymentData.address)).toBeTruthy();
        expect(receiptAfterMined).toEqual(
            expect.objectContaining({
                status: TxStatus.SUCCESS,
            }),
        );

        expect(receiptAfterMined.contract.instance.address).toEqual(deploymentData.address)
    }, 300_000)

    it("It mints a token", async () => {
        const contract = await TokenContract.deploy(wallets[0], accounts[0].address, "TestToken", "TT", 18).send().deployed();

        console.log("TODO: implement")
    }, 300_000)

    it("It transfers a token", async () => {
        const contract = await TokenContract.deploy(wallets[0], accounts[0].address, "TestToken", "TT", 18).send().deployed();

        console.log("TODO: implement")
    }, 300_000)

});